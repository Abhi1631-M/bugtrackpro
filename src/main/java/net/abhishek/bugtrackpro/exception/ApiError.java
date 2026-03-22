package net.abhishek.bugtrackpro.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ApiError {

    private String message;
    private int status;
    private LocalDateTime timestamp;

}
