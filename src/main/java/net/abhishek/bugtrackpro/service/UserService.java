package net.abhishek.bugtrackpro.service;

import net.abhishek.bugtrackpro.dto.request.UserRequestDTO;
import net.abhishek.bugtrackpro.dto.response.UserResponseDTO;

import java.util.List;

public interface UserService {

    UserResponseDTO createUser(UserRequestDTO dto);
    List<UserResponseDTO> getAllUsers();
}
