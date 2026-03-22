package net.abhishek.bugtrackpro.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;
    @NotBlank(message = "Comment message cannot be empty")
    private String message;
}
