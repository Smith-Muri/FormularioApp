package com.example.PaseoAPP.modelos;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "fotos_espacio")
public class FotoEspacio {

    @Id
    private UUID espacioId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "espacio_id")
    private Espacio espacio;

    @jakarta.persistence.Lob
    @jakarta.persistence.Column(nullable = false)
    private byte[] contenido;

    @jakarta.persistence.Column(nullable = false, length = 40)
    private String tipoContenido;

    protected FotoEspacio() {
    }

    public FotoEspacio(Espacio espacio, byte[] contenido, String tipoContenido) {
        this.espacio = espacio;
        this.contenido = contenido;
        this.tipoContenido = tipoContenido;
    }

    public UUID getEspacioId() {
        return espacioId;
    }

    public byte[] getContenido() {
        return contenido;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }
}
