package com.user.user_service.service;

import com.user.user_service.dto.LoginRequestDTO;
import com.user.user_service.dto.LoginResponseDTO;
import com.user.user_service.dto.UserRequestDTO;
import com.user.user_service.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO register(UserRequestDTO userRequestDTO);
    LoginResponseDTO login(LoginRequestDTO loginRequestDTO);
    UserResponseDTO getProfile(String email);
    List<UserResponseDTO> getAllUsers();
    void deleteUser(Long id);
    void toggleUserStatus(Long id, boolean enabled);
    void assignUserRole(Long id, String role);
    UserResponseDTO updateUser(Long id, UserRequestDTO userRequestDTO);
}
