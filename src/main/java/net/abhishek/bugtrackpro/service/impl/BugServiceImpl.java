package net.abhishek.bugtrackpro.service.impl;

import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.BugRequestDTO;
import net.abhishek.bugtrackpro.dto.response.BugResponseDTO;
import net.abhishek.bugtrackpro.entity.*;
import net.abhishek.bugtrackpro.exception.AccessDeniedException;
import net.abhishek.bugtrackpro.exception.BusinessException;
import net.abhishek.bugtrackpro.exception.ResourceNotFoundException;
import net.abhishek.bugtrackpro.mapper.BugMapper;
import net.abhishek.bugtrackpro.repository.BugRepository;
import net.abhishek.bugtrackpro.repository.ProjectRepository;
import net.abhishek.bugtrackpro.repository.UserRepository;
import net.abhishek.bugtrackpro.security.AuthUtil;
import net.abhishek.bugtrackpro.service.BugService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BugServiceImpl implements BugService {

    private final BugRepository bugRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;


    /**
     * CREATE BUG
     * Only TESTER Can Create Bugs
     */
    @Override
    public BugResponseDTO createBug(BugRequestDTO dto) {

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User loggedUser = authUtil.getLoggedUser();

        if (loggedUser.getRole() != Role.TESTER) {
            throw new AccessDeniedException("Only TESTER can create bugs");
        }

        Bug bug = Bug.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .type(dto.getType())
                .severity(dto.getSeverity())
                .project(project)
                .reportedBy(loggedUser)   // always the authenticated user — ignore dto.getReportedBy()
                .status(BugStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        Bug saved = bugRepository.save(bug);

        return BugMapper.toBugResponse(saved);
    }


    /**
     * GET BUGS OF PROJECT
     */
    @Override
    public List<BugResponseDTO> getBugsByProject(Long projectId) {

        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return bugRepository.findByProjectId(projectId)
                .stream()
                .map(BugMapper::toBugResponse)
                .toList();
    }


    /**
     * ASSIGN BUG
     * Only PROJECT_ADMIN Can Assign
     * Only Developers Can Be Assigned
     */
    @Override
    public BugResponseDTO assignBug(Long bugId, Long userId) {

        User loggedUser = authUtil.getLoggedUser();

        if (loggedUser.getRole() != Role.PROJECT_ADMIN) {
            throw new AccessDeniedException("Only PROJECT_ADMIN can assign bugs");
        }

        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found"));

        User dev = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (dev.getRole() != Role.DEVELOPER) {
            throw new BusinessException("Only DEVELOPER can be assigned to a bug");
        }

        bug.setAssignedTo(dev);
        bug.setStatus(BugStatus.ASSIGNED);

        return BugMapper.toBugResponse(bugRepository.save(bug));
    }


    /**
     * UPDATE BUG STATUS
     * Role Based + Workflow Validation
     */
    @Override
    public BugResponseDTO updateStatus(Long bugId, BugStatus newStatus) {

        User user = authUtil.getLoggedUser();

        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found"));

        // ===== ROLE PERMISSIONS =====

        // Developer Rules
        if (user.getRole() == Role.DEVELOPER) {

            if (newStatus == BugStatus.CLOSED || newStatus == BugStatus.REOPENED) {
                throw new AccessDeniedException("Developer cannot CLOSE or REOPEN bugs");
            }

            if (bug.getAssignedTo() == null
                    || !bug.getAssignedTo().equals(user.getId())) {
                throw new AccessDeniedException("Developer can update only their assigned bugs");
            }
        }

        // Tester Rules
        if (user.getRole() == Role.TESTER) {

            if (newStatus == BugStatus.IN_PROGRESS || newStatus == BugStatus.ASSIGNED) {
                throw new AccessDeniedException("Tester cannot change development workflow status");
            }
        }

        // ===== WORKFLOW VALIDATIONS =====
        switch (newStatus) {

            case ASSIGNED:
                if (bug.getAssignedTo() == null)
                    throw new BusinessException("Bug must be assigned before marking ASSIGNED");
                break;

            case IN_PROGRESS:
                if (bug.getAssignedTo() == null)
                    throw new BusinessException("Bug must be assigned before moving to IN_PROGRESS");

                if (bug.getStatus() == BugStatus.CLOSED)
                    throw new BusinessException("Cannot move CLOSED bug to IN_PROGRESS");
                break;

            case RESOLVED:
                if (bug.getStatus() != BugStatus.IN_PROGRESS)
                    throw new BusinessException("Bug must be IN_PROGRESS before marking RESOLVED");
                break;

            case CLOSED:
                if (bug.getStatus() != BugStatus.RESOLVED)
                    throw new BusinessException("Only RESOLVED bugs can be CLOSED");
                break;

            case REOPENED:
                if (bug.getStatus() != BugStatus.CLOSED)
                    throw new BusinessException("Only CLOSED bugs can be reopened");
                break;
        }

        bug.setStatus(newStatus);
        bug.setUpdatedAt(LocalDateTime.now());
        bugRepository.save(bug);

        return BugMapper.toBugResponse(bug);
    }

}
