package com.example.PaseoAPP;

import com.example.PaseoAPP.dtos.ReservaDTO;
import com.example.PaseoAPP.dtos.SolicitudReserva;
import com.example.PaseoAPP.enums.Rol;
import com.example.PaseoAPP.modelos.Espacio;
import com.example.PaseoAPP.modelos.FotoEspacio;
import com.example.PaseoAPP.modelos.Usuario;
import com.example.PaseoAPP.repositorios.IRepositorioEspacio;
import com.example.PaseoAPP.repositorios.IRepositorioFotoEspacio;
import com.example.PaseoAPP.repositorios.IRepositorioReserva;
import com.example.PaseoAPP.repositorios.IRepositorioUsuario;
import com.example.PaseoAPP.servicios.EspacioServicio;
import com.example.PaseoAPP.servicios.ReservaServicio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:paseo-test;DB_CLOSE_DELAY=-1")
@Transactional
class PaseoAppApplicationTests {

	@Autowired
	private ReservaServicio reservas;

	@Autowired
	private EspacioServicio espacios;

	@Autowired
	private IRepositorioEspacio repositorioEspacio;

	@Autowired
	private IRepositorioFotoEspacio repositorioFoto;

	@Autowired
	private IRepositorioReserva repositorioReserva;

	@Autowired
	private IRepositorioUsuario repositorioUsuario;

	@Test
	void contextLoads() {
	}

	@Test
	void reservaQuedaLigadaAlEspacioYRechazaCrucesSinBloquearOtrosHorarios() {
		Usuario usuario = crearUsuario("cliente@prueba.com");
		Espacio primero = repositorioEspacio.save(crearEspacio("Sala norte"));
		Espacio segundo = repositorioEspacio.save(crearEspacio("Sala sur"));
		var autenticacion = new UsernamePasswordAuthenticationToken(
				usuario.getCorreo(),
				"password",
				List.of(new SimpleGrantedAuthority("ROLE_USUARIO")));
		String fechaHora = LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0).toString();
		SolicitudReserva solicitud = new SolicitudReserva(primero.getId(), fechaHora, "60");

		ReservaDTO creada = reservas.guardarReservaEnBD(solicitud, autenticacion);

		assertEquals(primero.getId(), creada.espacioId());
		assertEquals(primero.getNombre(), creada.espacioNombre());
		assertEquals(usuario.getCorreo(), repositorioReserva.findByIdAndUsuario_Correo(
				creada.id(), usuario.getCorreo()).orElseThrow().getUsuario().getCorreo());
		ResponseStatusException conflicto = assertThrows(ResponseStatusException.class, () -> reservas.guardarReservaEnBD(
				new SolicitudReserva(primero.getId(), fechaHora.replace("T10:00", "T10:30"), "30"),
				autenticacion));
		assertEquals(HttpStatus.CONFLICT, conflicto.getStatusCode());
		assertEquals(segundo.getId(), reservas.guardarReservaEnBD(
				new SolicitudReserva(segundo.getId(), fechaHora, "60"),
				autenticacion).espacioId());
		assertEquals(primero.getId(), reservas.guardarReservaEnBD(
				new SolicitudReserva(primero.getId(), fechaHora.replace("T10:00", "T11:00"), "30"),
				autenticacion).espacioId());
	}

	@Test
	void guardaLaFotoDelEspacioYLaSirveDesdeElCatalogo() {
		byte[] contenido = {(byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a};
		MockMultipartFile archivo = new MockMultipartFile("foto", "sala.png", "image/png", contenido);

		Espacio creado = espacios.guardarEspacioEnBD(crearEspacio("Sala con foto"), archivo);

		assertEquals("/paseoapi/v1/espacios/" + creado.getId() + "/foto", creado.getFoto());
		FotoEspacio fotoGuardada = repositorioFoto.findById(creado.getId()).orElseThrow();
		assertEquals("image/png", fotoGuardada.getTipoContenido());
		assertArrayEquals(contenido, fotoGuardada.getContenido());
	}

	private Usuario crearUsuario(String correo) {
		Usuario usuario = new Usuario();
		usuario.setCorreo(correo);
		usuario.setNombres("Cliente de prueba");
		usuario.setContraseña("hash");
		usuario.setRol(Rol.USUARIO);
		return repositorioUsuario.save(usuario);
	}

	private Espacio crearEspacio(String nombre) {
		Espacio espacio = new Espacio();
		espacio.setNombre(nombre);
		espacio.setDescripcion("Espacio de prueba");
		espacio.setAforo(10);
		return espacio;
	}
}
