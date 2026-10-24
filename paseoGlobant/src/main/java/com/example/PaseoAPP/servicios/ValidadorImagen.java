package com.example.PaseoAPP.servicios;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;

@Component
public class ValidadorImagen {

    private static final long TAMANO_MAXIMO = 5L * 1024 * 1024;
    private static final Map<String, byte[]> FIRMAS = Map.of(
            "image/jpeg", new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff},
            "image/png", new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a},
            "image/webp", new byte[]{'R', 'I', 'F', 'F'}
    );

    public ImagenValidada validar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona una imagen.");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen no puede superar 5 MB.");
        }

        String tipo = archivo.getContentType();
        byte[] firma = FIRMAS.get(tipo);
        if (firma == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Usa una imagen JPG, PNG o WEBP.");
        }

        try {
            byte[] contenido = archivo.getBytes();
            boolean firmaValida = contenido.length >= firma.length
                    && Arrays.equals(firma, Arrays.copyOf(contenido, firma.length));
            boolean webpValido = !"image/webp".equals(tipo)
                    || (contenido.length >= 12 && contenido[8] == 'W' && contenido[9] == 'E'
                    && contenido[10] == 'B' && contenido[11] == 'P');
            if (!firmaValida || !webpValido) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El contenido del archivo no coincide con una imagen válida.");
            }
            return new ImagenValidada(contenido, tipo);
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pudo leer la imagen.", error);
        }
    }

    public record ImagenValidada(byte[] contenido, String tipoContenido) {
    }
}
