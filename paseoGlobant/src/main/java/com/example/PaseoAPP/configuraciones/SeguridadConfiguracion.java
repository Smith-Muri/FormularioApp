package com.example.PaseoAPP.configuraciones;

import com.example.PaseoAPP.modelos.Usuario;
import com.example.PaseoAPP.repositorios.IRepositorioUsuario;
import com.example.PaseoAPP.enums.Rol;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;

@Configuration
public class SeguridadConfiguracion {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(IRepositorioUsuario usuarios) {
        return correo -> {
            Usuario usuario = usuarios.findByCorreo(correo)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            return User.withUsername(usuario.getCorreo())
                    .password(usuario.getContraseña())
                    .roles(usuario.getRol().name())
                    .build();
        };
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    CookieCsrfTokenRepository csrfTokenRepository(
            @Value("${SESSION_COOKIE_SECURE:false}") boolean secure,
            @Value("${SESSION_COOKIE_SAME_SITE:lax}") String sameSite) {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieCustomizer(cookie -> cookie.secure(secure).sameSite(sameSite));
        return repository;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository,
            CsrfTokenRepository csrfTokenRepository) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.csrfTokenRepository(csrfTokenRepository))
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/paseoapi/v1/auth/csrf", "/paseoapi/v1/auth/login", "/paseoapi/v1/auth/logout").permitAll()
                        .requestMatchers("/paseoapi/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/paseoapi/v1/usuarios").permitAll()
                        .requestMatchers(HttpMethod.GET, "/paseoapi/v1/espacios").permitAll()
                        .requestMatchers(HttpMethod.GET, "/paseoapi/v1/espacios/*/foto").permitAll()
                        .requestMatchers("/paseoapi/v1/usuarios/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.POST, "/paseoapi/v1/espacios").hasRole("ADMINISTRADOR")
                        .requestMatchers("/paseoapi/v1/espacios/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("/paseoapi/v1/reservas/**").hasAnyRole("USUARIO", "ADMINISTRADOR")
                        .anyRequest().denyAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler((request, response, exception) ->
                                response.sendError(HttpStatus.FORBIDDEN.value())))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionFixation(fixation -> fixation.changeSessionId()));
        return http.build();
    }

    @Bean
    ApplicationRunner bootstrapAdministrator(
            IRepositorioUsuario usuarios,
            PasswordEncoder encoder,
            @Value("${app.admin.email:}") String correo,
            @Value("${app.admin.name:}") String nombre,
            @Value("${app.admin.password:}") String contraseña) {
        return args -> {
            usuarios.findAll().forEach(usuario -> {
                String contraseñaActual = usuario.getContraseña();
                if (contraseñaActual != null
                        && !contraseñaActual.startsWith("$2a$")
                        && !contraseñaActual.startsWith("$2b$")
                        && !contraseñaActual.startsWith("$2y$")) {
                    usuario.setContraseña(encoder.encode(contraseñaActual));
                    usuarios.save(usuario);
                }
            });

            boolean configured = !correo.isBlank() || !nombre.isBlank() || !contraseña.isBlank();
            if (!configured) return;

            if (correo.isBlank() || nombre.isBlank() || contraseña.length() < 12) {
                throw new IllegalStateException("Configure app.admin.email, app.admin.name y app.admin.password (mínimo 12 caracteres)");
            }

            usuarios.findByCorreo(correo).ifPresentOrElse(usuario -> {
                if (usuario.getRol() != Rol.ADMINISTRADOR) {
                    throw new IllegalStateException("El correo de app.admin.email ya existe con rol no administrador");
                }
            }, () -> {
                Usuario administrador = new Usuario();
                administrador.setCorreo(correo);
                administrador.setNombres(nombre);
                administrador.setContraseña(encoder.encode(contraseña));
                administrador.setRol(Rol.ADMINISTRADOR);
                usuarios.save(administrador);
            });
        };
    }
}
