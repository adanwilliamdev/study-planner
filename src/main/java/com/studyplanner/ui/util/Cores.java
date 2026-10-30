package com.studyplanner.ui.util;

import java.util.List;

public final class Cores {

    public static final String PADRAO = "#4A44E0";

    public static final List<String> PALETA = List.of(
            "#4A44E0", "#7C5CFF", "#0EA5E9", "#14B8A6", "#22C55E",
            "#F59E0B", "#F97316", "#EF4444", "#EC4899", "#64748B");

    private Cores() {
    }

    /** So aceita #RRGGBB; qualquer outra coisa vira a cor padrao (a cor vai para um style inline). */
    public static String seguro(String hex) {
        return hex != null && hex.matches("^#[0-9a-fA-F]{6}$") ? hex : PADRAO;
    }

    private static double luz(int c) {
        double s = c / 255.0;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }

    /** Branco ou azul-escuro, o que der mais contraste sobre a cor de fundo (#RRGGBB). */
    public static String textoSobre(String hex) {
        int n = Integer.parseInt(seguro(hex).substring(1), 16);
        double l = 0.2126 * luz((n >> 16) & 255) + 0.7152 * luz((n >> 8) & 255) + 0.0722 * luz(n & 255);
        double comBranco = 1.05 / (l + 0.05);
        double comEscuro = (l + 0.05) / 0.0676;
        return comBranco >= comEscuro ? "#FFFFFF" : "#1A1E52";
    }

    /** "Cálculo Diferencial" vira "CD". */
    public static String iniciais(String nome) {
        String[] partes = nome == null ? new String[0] : nome.trim().split("\\s+");
        if (partes.length == 0 || partes[0].isEmpty()) {
            return "?";
        }
        if (partes.length == 1) {
            String p = partes[0];
            return p.substring(0, Math.min(2, p.length())).toUpperCase();
        }
        return ("" + partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
    }
}
