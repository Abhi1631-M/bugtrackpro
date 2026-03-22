package net.abhishek.bugtrackpro.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BugResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String severity;
    private String type;
    private Long projectId;
    private Long reportedBy;
    private Long assignedTo;
}
