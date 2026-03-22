package net.abhishek.bugtrackpro.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRequestDTO {

    @NotBlank(message = "Project name is required")
    private String name;
    @NotBlank(message = "Description is required")
    private String description;
}
