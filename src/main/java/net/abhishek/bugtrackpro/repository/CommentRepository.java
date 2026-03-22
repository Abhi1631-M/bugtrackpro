package net.abhishek.bugtrackpro.repository;

import net.abhishek.bugtrackpro.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByBugId(Long bugId);
}
