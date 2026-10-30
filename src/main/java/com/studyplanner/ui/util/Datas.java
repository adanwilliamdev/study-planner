package com.studyplanner.ui.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public final class Datas {

    public static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATA_CURTA = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM HH:mm");
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter EXTENSO = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM", PT_BR);

    private Datas() {
    }

    public enum Tom {
        ATRASADA("chip--ruim"), URGENTE("chip--aviso"), PROXIMA("chip--marca"), NORMAL("chip--neutro");

        private final String classeCss;

        Tom(String classeCss) {
            this.classeCss = classeCss;
        }

        public String classeCss() {
            return classeCss;
        }
    }

    public record Prazo(Tom tom, String texto) {
    }

    /** Rotulo amigavel do prazo ("Hoje", "Amanhã", "Atrasada 2d"...), ou null se nao houver prazo. */
    public static Prazo prazo(LocalDate data, LocalDate hoje) {
        if (data == null) {
            return null;
        }
        long dias = ChronoUnit.DAYS.between(hoje, data);
        if (dias < 0) {
            return new Prazo(Tom.ATRASADA, "Atrasada " + (-dias) + "d");
        }
        if (dias == 0) {
            return new Prazo(Tom.URGENTE, "Hoje");
        }
        if (dias == 1) {
            return new Prazo(Tom.URGENTE, "Amanhã");
        }
        if (dias <= 7) {
            return new Prazo(Tom.PROXIMA, "Em " + dias + " dias");
        }
        return new Prazo(Tom.NORMAL, data.format(DATA_CURTA));
    }

    public static String nomeDia(DayOfWeek dia) {
        return maiuscula(dia.getDisplayName(TextStyle.FULL, PT_BR));
    }

    public static String diaCurto(LocalDate data) {
        return maiuscula(data.getDayOfWeek().getDisplayName(TextStyle.SHORT, PT_BR).replace(".", ""));
    }

    public static String extenso(LocalDate data) {
        return maiuscula(data.format(EXTENSO));
    }

    public static String data(LocalDate data) {
        return data == null ? "" : data.format(DATA);
    }

    public static String dataHora(java.time.LocalDateTime dh) {
        return dh.format(DATA_HORA);
    }

    public static String hora(LocalTime hora) {
        return hora.format(HORA);
    }

    /** 135 vira "2h 15min"; 45 vira "45 min". */
    public static String duracao(int minutos) {
        if (minutos < 60) {
            return minutos + " min";
        }
        int h = minutos / 60;
        int m = minutos % 60;
        return m == 0 ? h + "h" : h + "h " + m + "min";
    }

    private static String maiuscula(String s) {
        return s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
