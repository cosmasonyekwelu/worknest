import { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { applySchema } from "@/schemas/application";
import { useApplyJob } from "@/hooks/useApplications";
import { useJobDetails } from "@/hooks/useJobs";
import { toast } from "sonner-native";

export default function ApplyScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { data: job } = useJobDetails(jobId);
  const applyMutation = useApplyJob(jobId);
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState<any>(null);

  const questions = useMemo(() => job?.applicationQuestions || [], [job]);
  const { control, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: { portfolioUrl: "", linkedinUrl: "", firstname: "", lastname: "", email: "", phone: "", currentLocation: "" },
  });

  const pickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] });
    if (!result.canceled) setResume(result.assets[0]);
  };

  const submit = async () => {
    const data = getValues();
    if (!resume) return toast.error("Please upload a resume");
    const formData = new FormData();
    formData.append("resume", { uri: resume.uri, name: resume.name, type: resume.mimeType || "application/pdf" } as any);
    formData.append("portfolioUrl", data.portfolioUrl);
    formData.append("linkedinUrl", data.linkedinUrl);
    formData.append("personalInfo", JSON.stringify({ firstname: data.firstname, lastname: data.lastname, email: data.email, phone: data.phone, currentLocation: data.currentLocation }));
    formData.append("answers", JSON.stringify(questions.map((q: string, i: number) => ({ question: q, answer: (data as any)[`question_${i}`] || "" }))));
    await applyMutation.mutateAsync(formData);
    toast.success("Application submitted");
    router.replace("/(tabs)/applications");
  };

  return <Screen>
    <Text className="mb-4 text-xl font-semibold">Apply to {job?.title}</Text>
    {step === 1 && <View>
      <Button label={resume ? `Resume: ${resume.name}` : "Upload Resume (PDF/DOC/DOCX)"} variant="secondary" onPress={pickResume} />
      <Controller control={control} name="portfolioUrl" render={({ field: { value, onChange } }) => <Input label="Portfolio URL" value={value} onChangeText={onChange} />} />
      <Controller control={control} name="linkedinUrl" render={({ field: { value, onChange } }) => <Input label="LinkedIn URL" value={value} onChangeText={onChange} />} />
      <Button label="Next" onPress={() => setStep(2)} />
    </View>}
    {step === 2 && <View>
      {(["firstname", "lastname", "email", "phone", "currentLocation"] as const).map((f) => <Controller key={f} control={control} name={f} render={({ field: { value, onChange } }) => <Input label={f} value={value} onChangeText={onChange} error={errors[f]?.message as string} />} />)}
      <Button label="Next" onPress={handleSubmit(() => setStep(3))} />
    </View>}
    {step === 3 && <View>
      {questions.map((question: string, index: number) => <Controller key={index} control={control} name={`question_${index}` as any} render={({ field: { value, onChange } }) => <Input label={question} value={value} onChangeText={onChange} multiline />} />)}
      <Button label={applyMutation.isPending ? "Submitting..." : "Submit Application"} onPress={handleSubmit(submit)} disabled={applyMutation.isPending} />
    </View>}
  </Screen>;
}
