package net.abhishek.bugtrackpro.service.impl;


import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.CommentRequestDTO;
import net.abhishek.bugtrackpro.dto.response.CommentResponseDTO;
import net.abhishek.bugtrackpro.entity.Bug;
import net.abhishek.bugtrackpro.entity.Comment;
import net.abhishek.bugtrackpro.entity.User;
import net.abhishek.bugtrackpro.exception.ResourceNotFoundException;
import net.abhishek.bugtrackpro.mapper.CommentMapper;
import net.abhishek.bugtrackpro.repository.BugRepository;
import net.abhishek.bugtrackpro.repository.CommentRepository;
import net.abhishek.bugtrackpro.repository.UserRepository;
import net.abhishek.bugtrackpro.service.CommentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final BugRepository bugRepository;

    @Override
    public CommentResponseDTO addComment(Long bugId, CommentRequestDTO dto)
    {
        Bug bug = bugRepository.findById(bugId)
                  .orElseThrow(() -> new ResourceNotFoundException("Bug not found"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Comment comment=Comment.builder()
                .bug(bug)
                .user(user)
                .message(dto.getMessage())
                .createdAt(LocalDateTime.now())
                .build();
        Comment saved=commentRepository.save(comment);
        return CommentMapper.toCommentResponse(saved);
    }

    @Override
    public List<CommentResponseDTO> getComments(Long bugId) {
        return commentRepository.findByBugId(bugId)
                .stream()
                .map(CommentMapper::toCommentResponse)
                .toList();
    }
}
