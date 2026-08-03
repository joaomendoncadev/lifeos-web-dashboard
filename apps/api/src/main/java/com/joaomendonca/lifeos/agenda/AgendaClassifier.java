package com.joaomendonca.lifeos.agenda;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

public final class AgendaClassifier {
  private AgendaClassifier() {}
  private static final Set<String> GYM = Set.of("musculacao", "academia", "treino", "gym", "workout");
  private static final Set<String> STUDY = Set.of("ingles", "english", "gramatica", "conversacao", "estudo", "estudar", "aula");
  public static String normalize(String value) { return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").trim().toLowerCase(Locale.ROOT); }
  public static boolean containsAny(String value, Set<String> terms) { String n=normalize(value); return terms.stream().anyMatch(n::contains); }
  public static boolean isGym(String value) { return containsAny(value, GYM); }
  public static boolean isEnglishStudy(String value) { String n=normalize(value); return (n.contains("ingles") || n.contains("english") || n.contains("conversacao") || n.contains("gramatica")) && containsAny(value, STUDY); }
  public static String domain(String title, String type) {
    String n=normalize(title);
    if(n.contains("trabalho") || n.contains("work")) return "WORK";
    if(isGym(title) || n.contains("saude") || n.contains("corrida")) return "HEALTH";
    if(isEnglishStudy(title) || n.contains("estud") || n.contains("aula")) return "STUDY";
    return "PERSONAL";
  }
}
