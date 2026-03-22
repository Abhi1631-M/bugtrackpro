package net.abhishek.bugtrackpro.service;

import net.abhishek.bugtrackpro.dto.request.CommentRequestDTO;
import net.abhishek.bugtrackpro.dto.response.CommentResponseDTO;

import java.util.List;

public interface CommentService {

    CommentResponseDTO addComment(Long bugId, CommentRequestDTO dto);
        List<CommentResponseDTO> getComments(Long bugId);
}
