package net.abhishek.bugtrackpro.mapper;

import net.abhishek.bugtrackpro.dto.response.UserResponseDTO;
import net.abhishek.bugtrackpro.entity.User;

public class UserMapper {

    public static UserResponseDTO toUserResponse(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }


}
