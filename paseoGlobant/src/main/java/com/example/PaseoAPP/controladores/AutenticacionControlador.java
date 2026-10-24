package com.example.PaseoAPP.controladores;

import com.example.PaseoAPP.dtos.UsuarioDTO;
import com.example.PaseoAPP.mapeadores.IMapaUsuario;
import com.example.PaseoAPP.repositorios.IRepositorioUsuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/paseoapi/v1/auth")
public class AutenticacionControlador {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final IRepositorioUsuario usuarios;
    private final IMapaUsuario mapaUsuario;
    private final CsrfTokenRepository csrfTokenRepository;

    public AutenticacionControlador(
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository,
            IRepositorioUsuario usuarios,
            IMapaUsuario mapaUsuario,
            CsrfTokenRepository csrfTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.usuarios = usuarios;
        this.mapaUsuario = mapaUsuario;
        this.csrfTokenRepository = csrfTokenRepository;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/login")
    public UsuarioDTO login(
            @RequestBody Credenciales credenciales,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (credenciales.correo() == null || credenciales.correo().isBlank()
                || credenciales.contraseña() == null || credenciales.contraseña().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correo y contraseña son obligatorios");
        }
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            credenciales.correo(), credenciales.contraseña()));
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        csrfTokenRepository.saveToken(null, request, response);

        return usuarios.findByCorreo(authentication.getName())
                .map(mapaUsuario::convertir_modelo_a_dto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping("/me")
    public UsuarioDTO currentUser(Authentication authentication) {
        return usuarios.findByCorreo(authentication.getName())
                .map(mapaUsuario::convertir_modelo_a_dto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        csrfTokenRepository.saveToken(null, request, response);
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    public record Credenciales(String correo, String contraseña) {
    }
}
