import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/lib/api/client";
import Toast from "react-native-toast-message";

const SPECIES = [
  { key: "DOG", label: "Perro", emoji: "🐶" }, { key: "CAT", label: "Gato", emoji: "🐱" },
  { key: "BIRD", label: "Pájaro", emoji: "🐦" }, { key: "RABBIT", label: "Conejo", emoji: "🐰" },
  { key: "OTHER", label: "Otro", emoji: "🐾" },
];
const SIZES = [
  { key: "SMALL", label: "Pequeño" }, { key: "MEDIUM", label: "Mediano" },
  { key: "LARGE", label: "Grande" }, { key: "XLARGE", label: "Muy grande" },
];
const ENERGY = [{ key: "LOW", label: "Baja" }, { key: "MEDIUM", label: "Media" }, { key: "HIGH", label: "Alta" }];
const TEMPERAMENT_OPTIONS = ["Amigable","Jugueton","Tranquilo","Timido","Protector","Independiente","Sociable","Energetico","Obediente","Curioso"];

const inputStyle = { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#111827", backgroundColor: "#f9fafb" };

function PillGroup({ options, value, onChange, multi }: { options: {key:string;label:string;emoji?:string}[]; value: string|string[]; onChange:(v:any)=>void; multi?:boolean }) {
  function isActive(key: string) { return multi ? (value as string[]).includes(key) : value === key; }
  function toggle(key: string) {
    if (multi) { const arr = value as string[]; onChange(arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key]); }
    else { onChange(key); }
  }
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => (
        <Pressable key={o.key} onPress={() => toggle(o.key)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: isActive(o.key) ? "#fff7ed" : "#f9fafb", borderWidth: 1, borderColor: isActive(o.key) ? "#f97316" : "#e5e7eb" }}>
          {o.emoji && <Text style={{ fontSize: 16 }}>{o.emoji}</Text>}
          <Text style={{ fontSize: 13, fontWeight: "600", color: isActive(o.key) ? "#f97316" : "#374151" }}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function parseArr(json?: string | null): string[] {
  try { const v = JSON.parse(json ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: pet, isLoading } = useQuery<any>({
    queryKey: ["pet", id],
    queryFn: () => api.get(`/mobile/pets/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (pet && !initialized) {
      setName(pet.name ?? "");
      setSpecies(pet.species ?? "DOG");
      setBreed(pet.breed ?? "");
      setSex(pet.sex ?? "MALE");
      setSize(pet.size ?? "MEDIUM");
      setEnergyLevel(pet.energyLevel ?? "MEDIUM");
      setDateOfBirth(pet.dateOfBirth ? new Date(pet.dateOfBirth).toISOString().split("T")[0] : "");
      setAge(pet.age ? String(pet.age) : "");
      setWeight(pet.weight ? String(pet.weight) : "");
      setIsVaccinated(pet.isVaccinated ?? false);
      setIsNeutered(pet.isNeutered ?? false);
      setMicrochipId(pet.microchipId ?? "");
      setTemperament(parseArr(pet.temperament));
      setAllergies(parseArr(pet.allergies));
      setMedicalConditions(parseArr(pet.medicalConditions));
      setDiet(pet.diet ?? "");
      setDescription(pet.description ?? "");
      setInitialized(true);
    }
  }, [pet, initialized]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch(`/mobile/pets/${id}`, data).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pet", id] });
      Toast.show({ type: "success", text1: "¡Mascota actualizada!" });
      router.back();
    },
    onError: (err: any) => {
      Toast.show({ type: "error", text1: err?.response?.data?.error ?? "No se pudo actualizar" });
    },
  });

  function handleSubmit() {
    if (!name.trim()) { Toast.show({ type: "error", text1: "El nombre es requerido" }); return; }
    mutation.mutate({
      name: name.trim(), species, breed: breed.trim() || undefined, sex, size, energyLevel,
      dateOfBirth: dateOfBirth || undefined, age: age ? Number(age) : undefined,
      weight: weight ? Number(weight) : undefined, isVaccinated, isNeutered,
      microchipId: microchipId.trim() || undefined,
      temperament: JSON.stringify(temperament), allergies: JSON.stringify(allergies),
      medicalConditions: JSON.stringify(medicalConditions),
      diet: diet.trim() || undefined, description: description.trim() || undefined,
    });
  }

  if (isLoading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#f97316" size="large" /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Especie */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Tipo de mascota *</Text>
            <PillGroup options={SPECIES} value={species} onChange={setSpecies} />
          </View>

          {/* Básico */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Información básica</Text>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Nombre *</Text><TextInput value={name} onChangeText={setName} placeholder="Ej: Max" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Raza</Text><TextInput value={breed} onChangeText={setBreed} placeholder="Ej: Labrador" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Sexo</Text><PillGroup options={[{key:"MALE",label:"Macho"},{key:"FEMALE",label:"Hembra"}]} value={sex} onChange={setSex} /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Tamaño *</Text><PillGroup options={SIZES} value={size} onChange={setSize} /></View>
          </View>

          {/* Físico */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Datos físicos</Text>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Fecha de nacimiento</Text><TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Edad (meses)</Text><TextInput value={age} onChangeText={setAge} placeholder="Ej: 24" keyboardType="number-pad" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Peso (kg)</Text><TextInput value={weight} onChangeText={setWeight} placeholder="Ej: 15.5" keyboardType="decimal-pad" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
          </View>

          {/* Personalidad */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Personalidad</Text>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Nivel de energía *</Text><PillGroup options={ENERGY} value={energyLevel} onChange={setEnergyLevel} /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Temperamento</Text><PillGroup options={TEMPERAMENT_OPTIONS.map(t=>({key:t,label:t}))} value={temperament} onChange={setTemperament} multi /></View>
          </View>

          {/* Salud */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Salud</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ fontSize: 14, color: "#374151" }}>Vacunas al día</Text><Switch value={isVaccinated} onValueChange={setIsVaccinated} trackColor={{ true: "#f97316" }} thumbColor="#fff" /></View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ fontSize: 14, color: "#374151" }}>Esterilizado/a</Text><Switch value={isNeutered} onValueChange={setIsNeutered} trackColor={{ true: "#f97316" }} thumbColor="#fff" /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Microchip</Text><TextInput value={microchipId} onChangeText={setMicrochipId} placeholder="Ej: 123456789012345" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
          </View>

          {/* Alergias */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Alergias</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput value={allergyInput} onChangeText={setAllergyInput} placeholder="Ej: Pollo" style={[inputStyle, { flex: 1 }]} placeholderTextColor="#9ca3af" onSubmitEditing={() => { const v = allergyInput.trim(); if (v && !allergies.includes(v)) { setAllergies(p=>[...p,v]); setAllergyInput(""); }}} returnKeyType="done" />
              <Pressable onPress={() => { const v = allergyInput.trim(); if (v && !allergies.includes(v)) { setAllergies(p=>[...p,v]); setAllergyInput(""); }}} style={{ backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>+</Text></Pressable>
            </View>
            {allergies.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{allergies.map(a => <Pressable key={a} onPress={() => setAllergies(p=>p.filter(x=>x!==a))} style={{ backgroundColor: "#fee2e2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}><Text style={{ color: "#dc2626", fontSize: 13 }}>{a}</Text><Text style={{ color: "#dc2626" }}>✕</Text></Pressable>)}</View>}
          </View>

          {/* Condiciones */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Condiciones médicas</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput value={conditionInput} onChangeText={setConditionInput} placeholder="Ej: Displasia" style={[inputStyle, { flex: 1 }]} placeholderTextColor="#9ca3af" onSubmitEditing={() => { const v = conditionInput.trim(); if (v && !medicalConditions.includes(v)) { setMedicalConditions(p=>[...p,v]); setConditionInput(""); }}} returnKeyType="done" />
              <Pressable onPress={() => { const v = conditionInput.trim(); if (v && !medicalConditions.includes(v)) { setMedicalConditions(p=>[...p,v]); setConditionInput(""); }}} style={{ backgroundColor: "#f97316", borderRadius: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>+</Text></Pressable>
            </View>
            {medicalConditions.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{medicalConditions.map(c => <Pressable key={c} onPress={() => setMedicalConditions(p=>p.filter(x=>x!==c))} style={{ backgroundColor: "#f3f4f6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}><Text style={{ color: "#374151", fontSize: 13 }}>{c}</Text><Text style={{ color: "#6b7280" }}>✕</Text></Pressable>)}</View>}
          </View>

          {/* Más info */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6", gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>Más información</Text>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Dieta</Text><TextInput value={diet} onChangeText={setDiet} placeholder="Ej: Royal Canin 2 veces al día" style={inputStyle} placeholderTextColor="#9ca3af" /></View>
            <View style={{ gap: 6 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Descripción</Text><TextInput value={description} onChangeText={setDescription} placeholder="Cuenta algo sobre tu mascota..." style={[inputStyle,{height:80,textAlignVertical:"top"}]} placeholderTextColor="#9ca3af" multiline numberOfLines={3} /></View>
          </View>

          <Pressable onPress={handleSubmit} disabled={mutation.isPending} style={{ backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 }}>
            {mutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Guardar cambios</Text>}
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
