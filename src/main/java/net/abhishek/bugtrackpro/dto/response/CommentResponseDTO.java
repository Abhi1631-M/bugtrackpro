package net.abhishek.bugtrackpro.dto.response;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDTO {

    private Long id;
    private Long bugId;
    private Long userId;
    private String userName;
    private String message;
    private String createdAt;
}
