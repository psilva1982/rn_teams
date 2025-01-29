import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { groupCreate } from "@storage/group/groupCreate";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { Container, Content, Icon } from "./styles";
import { AppError } from "@utils/AppError";

export function NewGroup() {
  const [group, setGroup] = useState("");

  const navigation = useNavigation();
  async function handleNew() {
    try {
      if (group.trim().length <= 0) {
        Alert.alert("Novo grupo", "Informe o nome do grupo.");
        return;
      }

      await groupCreate(group);
      navigation.navigate("players", { group });
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Não foi possível criar o grupo");
        console.log(error);
      }
    }
  }

  return (
    <Container>
      <Header showBackButton />
      <Content>
        <Icon />
        <Highlight
          title="Nova turma"
          subtitle="Crie para adicionar as pessoas"
        />
        <Input placeholder="Nome da turma" onChangeText={setGroup} />
        <Button title="Criar" style={{ marginTop: 20 }} onPress={handleNew} />
      </Content>
    </Container>
  );
}
