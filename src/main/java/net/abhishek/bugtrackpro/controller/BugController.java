package net.abhishek.bugtrackpro.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.BugRequestDTO;
import net.abhishek.bugtrackpro.dto.response.BugResponseDTO;
import net.abhishek.bugtrackpro.entity.BugStatus;
import net.abhishek.bugtrackpro.service.BugService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
@RequiredArgsConstructor
public class BugController {

    private final BugService bugService;
    @PreAuthorize("hasRole('TESTER')")
    @PostMapping
    public BugResponseDTO createBug(@Valid @RequestBody BugRequestDTO dto) {
        return bugService.createBug(dto);
    }

    @GetMapping("/project/{projectId}")
    public List<BugResponseDTO> bugsByProject(@PathVariable Long projectId) {
        return bugService.getBugsByProject(projectId);
    }
    @PreAuthorize("hasRole('PROJECT_ADMIN')")
    @PutMapping("/{bugId}/assign/{userId}")
    public BugResponseDTO assignBug(
            @PathVariable Long bugId,
            @PathVariable Long userId
    ) {
        return bugService.assignBug(bugId, userId);
    }
    @PreAuthorize("hasAnyRole('DEVELOPER','TESTER')")
    @PutMapping("/{bugId}/status")
    public BugResponseDTO updateStatus(
            @PathVariable Long bugId,
            @RequestParam BugStatus status
    ) {

        return bugService.updateStatus(bugId, status);
    }
}
