package com.user.user_service.mapper;

import com.user.user_service.dto.UserRequestDTO;
import com.user.user_service.dto.UserResponseDTO;
import com.user.user_service.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(UserRequestDTO userRequestDTO);

    UserResponseDTO toDto(User user);
}
