import { RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SingleUserAvatar } from "../../components/avatars/SingleUserAvatar";
import { Button } from "../../components/buttons/Buttons";
import { TitledHeader } from "../../components/header/TitledHeader";
import { Spinner } from "../../components/Spinner";
import { colors, paragraph, small } from "../../constants/dogeStyle";
import { RoomStackParamList } from "../../navigation/mainNavigator/RoomNavigator";
import { useWrappedConn } from "../../shared-hooks/useConn";
import { useTypeSafeQuery } from "../../shared-hooks/useTypeSafeQuery";

const InviteButton: React.FC<{ style: ViewStyle; onPress: () => void }> = ({
  style,
  onPress,
}) => {
  const [invited, setInvited] = useState(false);
  return (
    <Button
      style={style}
      size="small"
      disabled={invited}
      onPress={() => {
        onPress();
        setInvited(true);
      }}
      title={invited ? "Invited" : "Invite"}
    />
  );
};

const Page = ({
  cursor,
}: {
  cursor: number;
  isLastPage: boolean;
  isOnlyPage: boolean;
  onLoadMore: (o: number) => void;
}) => {
  const conn = useWrappedConn();
  const { isLoading, data } = useTypeSafeQuery(
    ["getInviteList", cursor],
    {
      staleTime: Infinity,
      enabled: true,
      refetchOnMount: "always",
    },
    [cursor]
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary900,
        }}
      >
        <Spinner />
      </View>
    );
  }

  if (!data) {
    return null;
  }

  console.log(data);

  return (
    <>
      {data.users.map((user) => (
        <View
          key={user.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <SingleUserAvatar size="sm" src={{ uri: user.avatarUrl }} />
          <View style={{ paddingHorizontal: 10, flex: 1 }}>
            <Text style={{ ...paragraph }} numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text
              style={{ ...small, lineHeight: 14, color: colors.primary300 }}
              numberOfLines={1}
            >
              @{user.username}
            </Text>
          </View>
          <InviteButton
            onPress={() => conn.mutation.inviteToRoom(user.id)}
            style={{ alignSelf: "center", marginLeft: 10 }}
          />
        </View>
      ))}
    </>
  );
};

type RoomPageRouteProp = RouteProp<RoomStackParamList, "RoomInvitation">;

type InviteRoomPageProps = {
  route: RoomPageRouteProp;
};

const onShare = async (message: string) => {
  try {
    const result = await Share.share({
      message,
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    alert(error.message);
  }
};

export const InviteRoomPage: React.FC<InviteRoomPageProps> = ({ route }) => {
  const [cursors, setCursors] = useState([0]);
  const room = route.params.room;
  const url = "https://next.dogehouse.tv" + `/room/${room.id}`;

  return (
    <>
      <TitledHeader title={"Invite people"} showBackButton={true} />
      <View style={styles.container}>
        {room.isPrivate ? null : (
          <>
            <Button
              size="big"
              onPress={() => {
                onShare(url);
              }}
              title={"Send a link"}
              style={{ alignSelf: "center", marginBottom: 20 }}
            />
          </>
        )}
        <ScrollView>
          {cursors.map((cursor, i) => (
            <Page
              key={cursor}
              cursor={cursor}
              isOnlyPage={cursors.length === 1}
              onLoadMore={(c) => setCursors([...cursors, c])}
              isLastPage={i === cursors.length - 1}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary900,
    paddingHorizontal: 20,
  },
});
