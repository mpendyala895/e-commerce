package com.order.order_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.Map;

public class JwtUtils {
    public static Map<String, Object> getClaims(String token) {
        try {
            String cleanToken = token.replace("Bearer ", "").trim();
            String[] chunks = cleanToken.split("\\.");
            if (chunks.length < 2) {
                return Map.of();
            }
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            return new ObjectMapper().readValue(payload, Map.class);
        } catch (Exception e) {
            return Map.of();
        }
    }
}
