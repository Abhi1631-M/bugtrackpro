package net.abhishek.bugtrackpro.mapper;

import net.abhishek.bugtrackpro.dto.response.BugResponseDTO;
import net.abhishek.bugtrackpro.entity.Bug;

public class BugMapper {

    public static BugResponseDTO toBugResponse(Bug bug) {
        return BugResponseDTO.builder()
                .id(bug.getId())
                .title(bug.getTitle())
                .description(bug.getDescription())
                .status(bug.getStatus().name())
                .priority(bug.getPriority() != null ? bug.getPriority().name() : null)
                .severity(bug.getSeverity() != null ? bug.getSeverity().name() : null)
                .type(bug.getType() != null ? bug.getType().name() : null)
                .projectId(
                        bug.getProject() != null ? bug.getProject().getId() : null
                )
                .reportedBy(
                        bug.getReportedBy() != null ? bug.getReportedBy().getId() : null
                )
                .assignedTo(
                        bug.getAssignedTo() != null ? bug.getAssignedTo().getId() : null
                )
                .build();
    }

}
