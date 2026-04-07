import { Controller, useForm } from "react-hook-form";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { useApplicationDetails, useSubmitInterview } from "@/hooks/useApplications";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner-native";

export default function ApplicationDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: application, isLoading } = useApplicationDetails(id);
  const submitInterview = useSubmitInterview(id);
  const { control, handleSubmit } = useForm();

  if (isLoading) return <Screen><Text>Loading...</Text></Screen>;

  const questions = application?.interview_questions || [];
  const canInterview = application?.status === "interview" && questions.length > 0;

  return <Screen>
    <Text className="text-xl font-bold">{application?.job?.title || "Application"}</Text>
    <Text className="mt-1 text-slate-600">Status: {application?.status}</Text>
    <View className="mt-4 rounded-xl bg-white p-3"><Text>Portfolio: {application?.portfolioUrl || "N/A"}</Text><Text>LinkedIn: {application?.linkedinUrl || "N/A"}</Text></View>
    {canInterview && <View className="mt-6"><Text className="mb-2 text-lg font-semibold">AI Interview</Text>
      {questions.map((q: any, index: number) => <Controller key={index} control={control} name={`q_${index}`} render={({ field: { value, onChange } }) => <Input label={q.question} value={value} onChangeText={onChange} multiline />} />)}
      <Button label="Submit Interview" onPress={handleSubmit(async (values) => {
        const payload = questions.map((q: any, index: number) => ({ question: q.question, answer: (values as any)[`q_${index}`] || "" }));
        await submitInterview.mutateAsync(payload);
        toast.success("Interview submitted");
      })} />
    </View>}
  </Screen>;
}
