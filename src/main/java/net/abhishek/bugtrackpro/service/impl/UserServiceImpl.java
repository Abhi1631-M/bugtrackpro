package net.abhishek.bugtrackpro.service.impl;


import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.UserRequestDTO;
import net.abhishek.bugtrackpro.dto.response.UserResponseDTO;
import net.abhishek.bugtrackpro.entity.AccountStatus;
import net.abhishek.bugtrackpro.entity.User;
import net.abhishek.bugtrackpro.mapper.UserMapper;
import net.abhishek.bugtrackpro.repository.UserRepository;
import net.abhishek.bugtrackpro.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {

        User user = User.builder()
                .name(userRequestDTO.getName())
                .email(userRequestDTO.getEmail())
                .password(passwordEncoder.encode(userRequestDTO.getPassword()))
                .role(userRequestDTO.getRole())
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        User saved = userRepository.save(user);
        return UserMapper.toUserResponse(saved);

    }
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toUserResponse)
                .toList();
    }

}
