package net.abhishek.bugtrackpro.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import net.abhishek.bugtrackpro.entity.BugPriority;
import net.abhishek.bugtrackpro.entity.BugSeverity;
import net.abhishek.bugtrackpro.entity.BugType;
//import net.abhishek.bugtrackpro.entity.Severity;

@Getter
@Setter
public class BugRequestDTO {

    @NotBlank(message = "Bug title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    private BugPriority priority;
    private BugType type;
    private BugSeverity severity;
    private Long projectId;
    private Long reportedBy;   // tester ID
}
