package com.gateway.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Collection;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http){

        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/eureka/**").permitAll()
                        .pathMatchers("/api/users/login", "/api/users/register").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/product/by-skus").permitAll()
                        // Public product viewing
                        .pathMatchers(HttpMethod.GET, "/api/product", "/api/product/**").permitAll()
                        // Admin-Only endpoints
                        .pathMatchers(HttpMethod.POST, "/api/product", "/api/product/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/product", "/api/product/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/product", "/api/product/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers("/api/users/admin/**", "/api/users/all").hasAuthority("ROLE_ADMIN")
                        .pathMatchers("/api/orders/admin/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers("/api/inventory/admin/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers("/api/notifications/all").hasAuthority("ROLE_ADMIN")
                        .pathMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        // General authenticated user requests
                        .pathMatchers("/api/users/profile").authenticated()
                        .pathMatchers("/api/orders", "/api/orders/**").authenticated()
                        .pathMatchers("/api/saga/order").authenticated()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.reactive.CorsWebFilter corsWebFilter() {
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:5174");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new org.springframework.web.cors.reactive.CorsWebFilter(source);
    }

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setPrincipalClaimName("sub");
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Object roleObj = jwt.getClaims().get("role");
            if (roleObj instanceof String) {
                return Flux.just(new SimpleGrantedAuthority((String) roleObj));
            } else if (roleObj instanceof Collection) {
                Collection<?> roles = (Collection<?>) roleObj;
                return Flux.fromIterable(roles.stream()
                        .map(Object::toString)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList()));
            }
            return Flux.empty();
        });
        return converter;
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        byte[] keyBytes = Base64.getDecoder().decode("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
    }
}