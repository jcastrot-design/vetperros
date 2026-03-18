import { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const SPECIES = [
  { key: "DOG", label: "Perro", emoji: "🐶" },
  { key: "CAT", label: "Gato", emoji: "🐱" },
  { key: "BIRD", label: "Pájaro", emoji: "🐦" },
  { key: "RABBIT", label: "Conejo", emoji: "🐰" },
  { key: "OTHER", label: "Otro", emoji: "🐾" },
];

const SIZES = [
  { key: "SMALL", label: "Pequeño" },
  { key: "MEDIUM", label: "Mediano" },
  { key: "LARGE", label: "Grande" },
  { key: "XLARGE", label: "Muy grande" },
];

const ENERGY = [
  { key: "LOW", label: "Baja" },
  { key: "MEDIUM", label: "Media" },
  { key: "HIGH", label: "Alta" },
];

const TEMPERAMENT_OPTIONS = [
  "Amigable", "Jugueton", "Tranquilo", "Timido",
  "Protector", "Independiente", "Sociable", "Energetico",
  "Obediente", "Curioso",
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>{title}</Text>
      {children}
    </View>
  );
}

function PillGroup({ options, value, onChange, multi }: {
  options: { key: string; label: string; emoji?: string }[];
  value: string | string[];
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  function isActive(key: string) {
    return multi ? (value as string[]).includes(key) : value === key;
  }
  function toggle(key: string) {
    if (multi) {
      const arr = value as string[];
      onChange(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);
    } else {
      onChange(key);
    }
  }
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => toggle(o.key)}
          style={{
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: isActive(o.key) ? "#fff7ed" : "#f9fafb",
            borderWidth: 1, borderColor: isActive(o.key) ? "#f97316" : "#e5e7eb",
          }}
        >
          {o.emoji && <Text style={{ fontSize: 16 }}>{o.emoji}</Text>}
          <Text style={{ fontSize: 13, fontWeight: "600", color: isActive(o.key) ? "#f97316" : "#374151" }}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
  paddingHorizontal: 12, paddingVertical: 10,
  fontSize: 15, color: "#111827", backgroundColor: "#f9fafb",
};

export default function NewPetScreen() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("DOG");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("MALE");
  const [size, setSize] = useState("MEDIUM");
  const [energyLevel, setEnergyLevel] = useState("MEDIUM");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered] = useState(false);
  const [microchipId, setMicrochipId] = useState("");
  const [temperament, setTemperament] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [diet, setDiet] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/mobile/pets", data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      Toast.show({ type: "success", text1: "¡Mascota registrada!" });
      router.back();
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "No se pudo guardar la mascota" });
    },
  });

  function addAllergy() {
    const v = allergyInput.trim();
    if (v && !allergies.includes(v)) { setAllergies((p) => [...p, v]); setAllergyInput(""); }
  }
  function addCondition() {
    const v = conditionInput.trim();
    if (v && !medicalConditions.includes(v)) { setMedicalConditions((p) => [...p, v]); setConditionInput(""); }
  }

  function handleSubmit() {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "El nombre es requerido" });
      return;
    }
    mutation.mutate({
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      sex,
      size,
      energyLevel,
      dateOfBirth: dateOfBirth || undefined,
      age: age ? Number(age) : undefined,
      weight: weight ? Number(weight) : undefined,
      isVaccinated,
      isNeutered,
      microchipId: microchipId.trim() || undefined,
      temperament: JSON.stringify(temperament),
      allergies: JSON.stringify(allergies),
      medicalConditions: JSON.stringify(medicalConditions),
      diet: diet.trim() || undefined,
      description: description.trim() || undefined,
    });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Tipo */}
          <SectionCard title="Tipo de mascota *">
            <PillGroup options={SPECIES} value={species} onChange={setSpecies} />
          </SectionCard>

          {/* Nombre */}
          <SectionCard title="Información básica">
            <Field label="Nombre *">
              <TextInput value={name} onChangeText={setName} placeholder="Ej: Max, Luna, Rocky..." style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
            <Field label="Raza">
              <TextInput value={breed} onChangeText={setBreed} placeholder="Ej: Labrador, Mestizo..." style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
            <Field label="Sexo">
              <PillGroup options={[{ key: "MALE", label: "Macho" }, { key: "FEMALE", label: "Hembra" }]} value={sex} onChange={setSex} />
            </Field>
            <Field label="Tamaño *">
              <PillGroup options={SIZES} value={size} onChange={setSize} />
            </Field>
          </SectionCard>

          {/* Edad y peso */}
          <SectionCard title="Datos físicos">
            <Field label="Fecha de nacimiento (YYYY-MM-DD)">
              <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="Ej: 2022-05-14" style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
            <Field label="Edad (meses)">
              <TextInput value={age} onChangeText={setAge} placeholder="Ej: 24" keyboardType="number-pad" style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
            <Field label="Peso (kg)">
              <TextInput value={weight} onChangeText={setWeight} placeholder="Ej: 15.5" keyboardType="decimal-pad" style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
          </SectionCard>

          {/* Energía y temperamento */}
          <SectionCard title="Personalidad">
            <Field label="Nivel de energía *">
              <PillGroup options={ENERGY} value={energyLevel} onChange={setEnergyLevel} />
            </Field>
            <Field label="Temperamento (selecciona varios)">
              <PillGroup options={TEMPERAMENT_OPTIONS.map((t) => ({ key: t, label: t }))} value={temperament} onChange={setTemperament} multi />
            </Field>
          </SectionCard>

          {/* Salud */}
          <SectionCard title="Salud">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#374151" }}>Vacunas al día</Text>
              <Switch value={isVaccinated} onValueChange={setIsVaccinated} trackColor={{ true: "#f97316" }} thumbColor="#fff" />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#374151" }}>Esterilizado/a</Text>
              <Switch value={isNeutered} onValueChange={setIsNeutered} trackColor={{ true: "#f97316" }} thumbColor="#fff" />
            </View>
            <Field label="Número de microchip">
              <TextInput value={microchipId} onChangeText={setMicrochipId} placeholder="Ej: 123456789012345" style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
          </SectionCard>

          {/* Alergias */}
          <SectionCard title="Alergias">
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={allergyInput} onChangeText={setAllergyInput}
                placeholder="Ej: Pollo, Polen..." style={[inputStyle, { flex: 1 }]}
                placeholderTextColor="#9ca3af" onSubmitEditing={addAllergy} returnKeyType="done"
              />
              <Pressable onPress={addAllergy} style={{ backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>+</Text>
              </Pressable>
            </View>
            {allergies.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {allergies.map((a) => (
                  <Pressable key={a} onPress={() => setAllergies((p) => p.filter((x) => x !== a))}
                    style={{ backgroundColor: "#fee2e2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: "#dc2626", fontSize: 13 }}>{a}</Text>
                    <Text style={{ color: "#dc2626", fontSize: 12 }}>✕</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </SectionCard>

          {/* Condiciones médicas */}
          <SectionCard title="Condiciones médicas">
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={conditionInput} onChangeText={setConditionInput}
                placeholder="Ej: Displasia, Epilepsia..." style={[inputStyle, { flex: 1 }]}
                placeholderTextColor="#9ca3af" onSubmitEditing={addCondition} returnKeyType="done"
              />
              <Pressable onPress={addCondition} style={{ backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>+</Text>
              </Pressable>
            </View>
            {medicalConditions.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {medicalConditions.map((c) => (
                  <Pressable key={c} onPress={() => setMedicalConditions((p) => p.filter((x) => x !== c))}
                    style={{ backgroundColor: "#f3f4f6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: "#374151", fontSize: 13 }}>{c}</Text>
                    <Text style={{ color: "#6b7280", fontSize: 12 }}>✕</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </SectionCard>

          {/* Dieta y descripción */}
          <SectionCard title="Más información">
            <Field label="Dieta">
              <TextInput value={diet} onChangeText={setDiet} placeholder="Ej: Royal Canin Medium Adult, 2 veces al día" style={inputStyle} placeholderTextColor="#9ca3af" />
            </Field>
            <Field label="Descripción">
              <TextInput
                value={description} onChangeText={setDescription}
                placeholder="Cuenta algo sobre tu mascota..."
                style={[inputStyle, { height: 80, textAlignVertical: "top" }]}
                placeholderTextColor="#9ca3af" multiline numberOfLines={3}
              />
            </Field>
          </SectionCard>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={mutation.isPending}
            style={{ backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 }}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Guardar mascota</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
