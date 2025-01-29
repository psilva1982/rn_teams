import { useState, useEffect, useRef } from "react";
import { Alert, FlatList, TextInput } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { Container, Form, HeaderList, NumberOfPlayers } from "./styles";

import { Highlight } from "@components/Highlight";
import { Header } from "@components/Header";
import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { Filter } from "@components/Filter";
import { PlayerCard } from "@components/PlayerCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";

import { AppError } from "@utils/AppError";

import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { PlayerStorageDTO } from "@storage/player/playerStorage.DTO";
import { playersGetByGroupAndTeam } from "@storage/player/playersGetByGroupAndTeam";
import { playersRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { groupRemoveByName } from "@storage/group/groupRemoveByName";

type RouteParams = {
  group: string;
};

export function Players() {
  const [playerName, setPlayerName] = useState("");
  const [team, setTeam] = useState("Time A");
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);
  const route = useRoute();
  const { group } = route.params as RouteParams;
  const navigation = useNavigation();

  const newPlayerNameInput = useRef<TextInput>(null);

  async function handleAddPlayer() {
    if (playerName.trim().length <= 0) {
      return Alert.alert("Novo jogador", "Erro ao adicionar um novo jogador");
    }

    const newPlayer: PlayerStorageDTO = {
      name: playerName,
      team: team,
    };

    try {
      await playerAddByGroup(newPlayer, group);
      newPlayerNameInput.current?.blur();

      setPlayerName("");
      fetchPlayerByTeam();
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert("Novo jogador", error.message);
      } else {
        console.log(error);
        Alert.alert("Novo jogador", "não foi possível adicionar.");
      }
    }
  }

  async function handleRemovePlayer(playerName: string) {
    try {
      await playersRemoveByGroup(group, playerName);
      fetchPlayerByTeam();
    } catch (error) {
      console.log(error);
      Alert.alert("Remover pessoa", "Não foi possível remover essa pessoa.");
    }
  }

  async function fetchPlayerByTeam() {
    try {
      const playersByTeam = await playersGetByGroupAndTeam(group, team);
      setPlayers(playersByTeam);
    } catch (error) {
      console.log(error);
      Alert.alert("Jogadores", "Não foi possível carregar os jogadores.");
    }
  }

  async function handleRemoveGroup() {
    Alert.alert("Remover", `Dejesa remover o grupo ${group}`, [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: () => doRemoveGroup(),
      },
    ]);
  }

  async function doRemoveGroup() {
    try {
      await groupRemoveByName(group);
      navigation.navigate("groups");
    } catch (error) {
      console.log(error);
      Alert.alert("Grupo", "Não foi possível remover este grupo.");
    }
  }

  useEffect(() => {
    fetchPlayerByTeam();
  }, [team]);

  return (
    <Container>
      <Header showBackButton />
      <Highlight title={group} subtitle="adicione a galera e separe os times" />
      <Form>
        <Input
          inputRef={newPlayerNameInput}
          placeholder="Nome do jogador"
          autoCorrect={false}
          onChangeText={setPlayerName}
          value={playerName}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
        />
        <ButtonIcon icon="add" onPress={handleAddPlayer} />
      </Form>

      <HeaderList>
        <FlatList
          data={["Time A", "Time B"]}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <Filter
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />
        <NumberOfPlayers>{players.length}</NumberOfPlayers>
      </HeaderList>

      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PlayerCard
            name={item.name}
            onRemove={() => handleRemovePlayer(item.name)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <ListEmpty message="Não há pessoas nesse time." />
        )}
        contentContainerStyle={[
          { paddingBottom: 100 },
          players.length === 0 && { flex: 1 },
        ]}
      />

      <Button
        title="Remover turma"
        type="SECONDARY"
        onPress={handleRemoveGroup}
      />
    </Container>
  );
}
