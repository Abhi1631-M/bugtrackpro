package net.abhishek.bugtrackpro.mapper;

import net.abhishek.bugtrackpro.dto.response.CommentResponseDTO;
import net.abhishek.bugtrackpro.entity.Comment;

public class CommentMapper {

    public static CommentResponseDTO toCommentResponse(Comment comment) {
        return  CommentResponseDTO.builder()
                .id(comment.getId())
                .bugId(comment.getBug().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt().toString())
                .build();
    }
}
