package net.abhishek.bugtrackpro.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.CommentRequestDTO;
import net.abhishek.bugtrackpro.dto.response.CommentResponseDTO;
import net.abhishek.bugtrackpro.service.CommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs/{bugId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public CommentResponseDTO addComment(
            @PathVariable Long bugId,   @Valid
            @RequestBody CommentRequestDTO dto
    ) {
        return commentService.addComment(bugId, dto);
    }
    @GetMapping
    public List<CommentResponseDTO> getComments(@PathVariable Long bugId) {
        return commentService.getComments(bugId);
    }
}
