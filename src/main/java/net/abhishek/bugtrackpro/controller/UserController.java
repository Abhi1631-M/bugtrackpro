package net.abhishek.bugtrackpro.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.UserRequestDTO;
import net.abhishek.bugtrackpro.dto.response.UserResponseDTO;
import net.abhishek.bugtrackpro.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @PostMapping
    public UserResponseDTO createUser(@Valid @RequestBody UserRequestDTO dto) {
        return userService.createUser(dto);
    }
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROJECT_ADMIN')")
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

}

