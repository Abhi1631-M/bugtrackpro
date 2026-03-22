package net.abhishek.bugtrackpro.service;

import net.abhishek.bugtrackpro.dto.request.BugRequestDTO;
import net.abhishek.bugtrackpro.dto.response.BugResponseDTO;
import net.abhishek.bugtrackpro.entity.BugStatus;
import java.util.List;

public interface BugService {

    BugResponseDTO createBug(BugRequestDTO dto);

    List<BugResponseDTO> getBugsByProject(Long projectId);

    BugResponseDTO assignBug(Long bugId, Long userId);

    BugResponseDTO updateStatus(Long bugId, BugStatus status);
}
