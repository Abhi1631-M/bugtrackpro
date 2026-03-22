package net.abhishek.bugtrackpro.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import net.abhishek.bugtrackpro.entity.AccountStatus;
import net.abhishek.bugtrackpro.entity.Role;
import org.springframework.stereotype.Service;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private AccountStatus status;



}
