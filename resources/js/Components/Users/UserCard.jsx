import { Card, ActionIcon, Badge, Text, Group, Stack } from "@mantine/core";
import { CalendarDays, Mail, Pencil, Trash2 } from "lucide-react";

export default function UserCard({
    user,
    canEdit = false,
    canDelete = false,
    onEdit,
    onDelete,
}) {
    const getInitials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U";

    const roleName = user?.roles?.[0]?.name || "Member";
    const normalizedRole = roleName.toLowerCase();
    const joinedDate = user?.created_at || user?.createAt || user?.createdAt;

    const formatJoinedDate = (dateValue) => {
        if (!dateValue) {
            return "N/A";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    const roleBadgeClass = (() => {
        if (normalizedRole.includes("admin")) {
            return "border-orange-200 bg-orange-50 text-orange-700";
        }

        if (normalizedRole.includes("manager")) {
            return "border-orange-200 bg-orange-50 text-orange-700";
        }

        if (normalizedRole.includes("cashier")) {
            return "border-amber-200 bg-amber-50 text-amber-700";
        }

        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    })();

    return (
        <Card withBorder className="bg-card w-full max-w-sm rounded-2xl">
            <Group justify="space-between" className="mb-4">
                <Group gap={"lg"}>
                    <img
                        src={"/images/avatar.png"}
                        width={80}
                        className="rounded-full border border-card-border"
                        fit="cover"
                        alt="Avatar"
                    />
                    <Stack>
                        <Text className="text-2xl" fw={700}>
                            {user?.name || "User Name"}
                        </Text>
                        <Badge
                            color="pink"
                            size="md"
                            variant="light"
                            className="bg-success-bg text-success"
                        >
                            {roleName}
                        </Badge>
                    </Stack>
                </Group>

                <Group gap={"xs"}>
                    <ActionIcon
                        size={"lg"}
                        radius={"md"}
                        className="bg-info-bg hover:bg-infoColor/50"
                        onClick={() => onEdit?.(user)}
                        aria-label="Edit user"
                        type="button"
                    >
                        <Pencil
                            size={18}
                            strokeWidth={2.5}
                            className="text-infoColor"
                        />
                    </ActionIcon>
                    <ActionIcon
                        size={"lg"}
                        radius={"md"}
                        className="bg-danger-bg hover:bg-danger/50"
                        onClick={() => onDelete?.(user)}
                        aria-label="Delete user"
                        type="button"
                    >
                        <Trash2
                            size={18}
                            strokeWidth={2.5}
                            className="text-danger"
                        />
                    </ActionIcon>
                </Group>
            </Group>
            <Text
                size="sm"
                className="flex items-center gap-2 text-secondary-text"
            >
                <Mail size={14} /> {user?.email || "example@email.com"}
            </Text>
            <Text
                size="sm"
                className="flex items-center gap-2 text-secondary-text"
            >
                <CalendarDays size={14} />
                Joined {formatJoinedDate(joinedDate)}
            </Text>
        </Card>
    );
}
