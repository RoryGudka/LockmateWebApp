import { addLinkedAccount, addGuestAccount, removeUser, makeOwner, makeResident, updateGuestAccess, getStatus } from "../libs/server";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import BackButton from "../components/BackButton";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import Select from "../components/Select";
import DateTimePicker from "../components/DateTimePicker";
import { useDevice } from "../context/DeviceContext";
import { useToast } from "../components/ToastProvider";
import { useUser } from "../context/UserContext";
import { palette } from "../theme";

type UserType = "resident" | "guest";

interface UserAction {
  email: string;
  isOwner: boolean;
  isGuest: boolean;
}

const ManageUsersPage: React.FC = () => {
  const { device, setDevice } = useDevice();
  const { userEmail } = useUser();
  const { showToast } = useToast();
  const [accountError, setAccountError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("resident");
  const [startTimeOption, setStartTimeOption] = useState<string>("now");
  const [expirationOption, setExpirationOption] = useState<string>("none");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customExpirationTime, setCustomExpirationTime] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<{ email: string; startTime: string; expirationTime: string | null } | null>(null);

  // Refresh device data on mount
  useEffect(() => {
    const refreshDevice = async () => {
      if (!device?.deviceId) return;
      try {
        const status = await getStatus(device.deviceId);
        console.log("Refreshed device status:", status);
        setDevice({
          ...device,
          ownerId: status.data.ownerId,
          linkedUserIds: status.data.linkedUserIds,
          guests: status.data.guests,
        });
      } catch (e) {
        console.error("Failed to refresh device:", e);
      }
    };
    refreshDevice();
  }, []);

  const calculateExpirationTime = (option: string): string | null => {
    if (option === "none") return null;

    const now = new Date();
    switch (option) {
      case "1hour":
        now.setHours(now.getHours() + 1);
        break;
      case "1day":
        now.setDate(now.getDate() + 1);
        break;
      case "1week":
        now.setDate(now.getDate() + 7);
        break;
      case "1month":
        now.setMonth(now.getMonth() + 1);
        break;
      case "custom":
        return customExpirationTime;
      default:
        return null;
    }
    return now.toISOString();
  };

  const getStartTime = (): string => {
    if (startTimeOption === "now") {
      return new Date().toISOString();
    }
    return new Date(customStartTime).toISOString();
  };

  const handleAddAccount = async () => {
    if (!device?.deviceId) {
      setAccountError("No device available. Please reconnect your Lockmate.");
      return;
    }

    const email = newEmail.trim().toLowerCase();
    setAccountError("");

    if (!email) {
      setAccountError("Please enter an email address.");
      return;
    }

    if (!email.includes("@")) {
      setAccountError("Please enter a valid email address.");
      return;
    }

    // Validation for guest users
    if (userType === "guest") {
      if (startTimeOption === "custom" && !customStartTime) {
        setAccountError("Please select a custom start time.");
        return;
      }
      if (expirationOption === "custom" && !customExpirationTime) {
        setAccountError("Please select a custom expiration time.");
        return;
      }
    }

    try {
      if (userType === "resident") {
        const response = await addLinkedAccount(device.deviceId, email);
        setDevice({ ...device, linkedUserIds: response.linkedUserIds });
        showToast({
          title: "Resident added",
          description: `${email} now has access to this device.`,
          tone: "success",
        });
      } else {
        const startTime = getStartTime();
        const expirationTime = calculateExpirationTime(expirationOption);
        const response = await addGuestAccount(
          device.deviceId,
          email,
          startTime,
          expirationTime,
        );
        setDevice({ ...device, guests: response.guests });
        showToast({
          title: "Guest added",
          description: `${email} has been granted temporary access.`,
          tone: "success",
        });
      }

      // Reset form
      setNewEmail("");
      setUserType("resident");
      setStartTimeOption("now");
      setExpirationOption("none");
      setCustomStartTime("");
      setCustomExpirationTime("");
    } catch (e: any) {
      setAccountError(e?.response?.data?.error || "Unable to add account.");
    }
  };

  const handleUserClick = (email: string, isCurrentUser: boolean, isGuest: boolean) => {
    setSelectedUser({ email, isOwner: isCurrentUser, isGuest });
    setDialogOpen(true);
  };

  const handleMakeOwner = async () => {
    if (!selectedUser || !device?.deviceId) return;
    
    try {
      const response = await makeOwner(device.deviceId, selectedUser.email);
      setDevice({ 
        ...device, 
        ownerId: response.ownerId,
        linkedUserIds: response.linkedUserIds,
        guests: response.guests 
      });
      showToast({
        title: "Ownership transferred",
        description: `${selectedUser.email} is now the owner.`,
        tone: "success",
      });
      setDialogOpen(false);
    } catch (e: any) {
      showToast({
        title: "Error",
        description: e?.response?.data?.error || "Unable to transfer ownership.",
        tone: "error",
      });
    }
  };

  const handleMakeResident = async () => {
    if (!selectedUser || !device?.deviceId) return;
    
    try {
      const response = await makeResident(device.deviceId, selectedUser.email);
      setDevice({ 
        ...device, 
        linkedUserIds: response.linkedUserIds,
        guests: response.guests 
      });
      showToast({
        title: "User converted",
        description: `${selectedUser.email} is now a resident.`,
        tone: "success",
      });
      setDialogOpen(false);
    } catch (e: any) {
      showToast({
        title: "Error",
        description: e?.response?.data?.error || "Unable to convert to resident.",
        tone: "error",
      });
    }
  };

  const handleEditSchedule = async () => {
    if (!selectedUser) return;
    const guest = device?.guests?.find((g: any) => g.email === selectedUser.email);
    if (guest) {
      setEditingGuest(guest);
      
      // Set form values based on current guest data
      setStartTimeOption("custom");
      setCustomStartTime(guest.startTime || "");
      
      // Determine expiration option
      if (!guest.expirationTime) {
        setExpirationOption("none");
        setCustomExpirationTime("");
      } else {
        setExpirationOption("custom");
        setCustomExpirationTime(guest.expirationTime);
      }
      
      setEditScheduleOpen(true);
    }
    setDialogOpen(false);
  };

  const handleSaveSchedule = async () => {
    if (!editingGuest || !device?.deviceId) return;

    try {
      const startTime = getStartTime();
      const expirationTime = calculateExpirationTime(expirationOption);
      
      const response = await updateGuestAccess(
        device.deviceId,
        editingGuest.email,
        startTime,
        expirationTime
      );
      
      setDevice({ ...device, guests: response.guests });
      showToast({
        title: "Schedule updated",
        description: `Access schedule for ${editingGuest.email} has been updated.`,
        tone: "success",
      });
      setEditScheduleOpen(false);
      setEditingGuest(null);
    } catch (e: any) {
      showToast({
        title: "Error",
        description: e?.response?.data?.error || "Unable to update schedule.",
        tone: "error",
      });
    }
  };

  const handleRemoveAccess = async () => {
    if (!selectedUser || !device?.deviceId) return;
    
    try {
      const response = await removeUser(device.deviceId, selectedUser.email);
      setDevice({ 
        ...device, 
        linkedUserIds: response.linkedUserIds,
        guests: response.guests 
      });
      showToast({
        title: "Access removed",
        description: `${selectedUser.email} no longer has access.`,
        tone: "success",
      });
      setDialogOpen(false);
    } catch (e: any) {
      showToast({
        title: "Error",
        description: e?.response?.data?.error || "Unable to remove access.",
        tone: "error",
      });
    }
  };

  const linkedAccounts = device?.linkedUserIds || [];
  const guests = device?.guests || [];
  const ownerId = device?.ownerId;
  
  // Determine current user's role
  const isCurrentUserOwner = userEmail === ownerId;
  const isCurrentUserResident = linkedAccounts.includes(userEmail || '');
  const isCurrentUserGuest = guests.some((g: any) => g.email === userEmail);
  
  console.log("Device:", device);
  console.log("Linked accounts:", linkedAccounts);
  console.log("Guests:", guests);
  console.log("Current user role:", { isCurrentUserOwner, isCurrentUserResident, isCurrentUserGuest });
  
  // Helper to get guest status
  const getGuestStatus = (guest: any) => {
    const now = new Date();
    const startDate = new Date(guest.startTime);
    const expirationDate = guest.expirationTime ? new Date(guest.expirationTime) : null;
    
    if (startDate > now) {
      return 'not-started';
    }
    if (expirationDate && expirationDate < now) {
      return 'expired';
    }
    return 'active';
  };
  
  // Combine all users (residents and guests)
  const allUsers = [
    ...linkedAccounts.map(email => ({ 
      email, 
      isGuest: false, 
      isOwner: email === ownerId,
      guestStatus: null 
    })),
    ...guests.map(guest => ({ 
      email: guest.email, 
      isGuest: true,
      isOwner: false,
      guestStatus: getGuestStatus(guest)
    }))
  ];
  
  console.log("All users:", allUsers);
  
  // Remove duplicates (prefer resident status over guest)
  const uniqueUsers = Array.from(
    new Map(allUsers.map(user => [user.email, user])).values()
  );
  
  // Sort users: Owner, Residents, Active Guests, Not Started Guests, Expired Guests
  uniqueUsers.sort((a, b) => {
    if (a.isOwner) return -1;
    if (b.isOwner) return 1;
    if (!a.isGuest && b.isGuest) return -1;
    if (a.isGuest && !b.isGuest) return 1;
    if (a.isGuest && b.isGuest) {
      const statusOrder: any = { 'active': 1, 'not-started': 2, 'expired': 3 };
      return statusOrder[a.guestStatus] - statusOrder[b.guestStatus];
    }
    return 0;
  });
  
  console.log("Unique users:", uniqueUsers);

  return (
    <Page>
      <PageWrapper>
        <BackButton text="Back" href="/home" />
        <Title text="Manage allowed users" />

        {/* Section: Current Users */}
        <div style={{ marginTop: "32px", textAlign: "left" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: 0,
              marginBottom: "10px",
              color: palette.text.main,
              textAlign: "center",
            }}
          >
            Current users
          </h3>
          <div
            style={{
              background: palette.gray.main,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {uniqueUsers.length ? (
              uniqueUsers.map((user, index) => {
                const isCurrentUser = userEmail && user.email === userEmail;
                const isGuest = user.isGuest;
                
                let statusLabel = "Resident";
                let statusColor = palette.gray.darkest;
                
                if (user.isOwner) {
                  statusLabel = "Owner";
                  statusColor = palette.blue.main;
                } else if (isGuest) {
                  if (user.guestStatus === 'not-started') {
                    statusLabel = "Guest - Not started";
                    statusColor = palette.gray.darkest;
                  } else if (user.guestStatus === 'expired') {
                    statusLabel = "Guest - Expired";
                    statusColor = "#c00";
                  } else {
                    statusLabel = "Guest";
                    statusColor = palette.gray.darkest;
                  }
                }
                
                return (
                  <button
                    key={user.email}
                    onClick={() => handleUserClick(user.email, !!isCurrentUser, isGuest)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "13px 16px",
                      borderBottom:
                        index !== uniqueUsers.length - 1
                          ? `1px solid ${palette.gray.dark}`
                          : "none",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e8e8ec";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 400,
                        color: palette.text.main,
                      }}
                    >
                      {user.email}
                    </span>
                    <span
                      style={{
                        color: statusColor,
                        fontWeight: user.isOwner ? 600 : 500,
                        fontSize: "13px",
                      }}
                    >
                      {statusLabel}
                    </span>
                  </button>
                );
              })
            ) : (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: palette.gray.darkest,
                  padding: "13px 16px",
                  textAlign: "center",
                }}
              >
                No users yet
              </div>
            )}
          </div>
        </div>

        {/* Section: Add New User - Only for Owner and Residents */}
        {(isCurrentUserOwner || isCurrentUserResident) && (
        <div style={{ marginTop: "32px", textAlign: "left" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: 0,
              marginBottom: "10px",
              color: palette.text.main,
              textAlign: "center",
            }}
          >
            Add new user
          </h3>

          <div style={{ marginBottom: "12px" }}>
            <Select
              value={userType}
              onChange={(value) => setUserType(value as UserType)}
              options={[
                { value: "resident", label: "Resident" },
                { value: "guest", label: "Guest" },
              ]}
              label="User type"
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
                color: palette.text.main,
                textAlign: "left",
              }}
            >
              Email address
            </label>
            <TextField
              value={newEmail}
              onChange={(e: any) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              onKeyDown={(event: any) => {
                if (event.key === "Enter") handleAddAccount();
              }}
            />
          </div>

          {/* Guest Settings */}
          {userType === "guest" && (
            <div
              style={{
                marginTop: "20px",
                background: "#fafafa",
                borderRadius: "10px",
                padding: "16px",
                border: `1px solid ${palette.gray.dark}`,
              }}
            >
              <div style={{ marginBottom: "14px" }}>
                <Select
                  value={startTimeOption}
                  onChange={setStartTimeOption}
                  options={[
                    { value: "now", label: "Now" },
                    { value: "custom", label: "Custom date & time" },
                  ]}
                  label="Access start time"
                />
              </div>

              {startTimeOption === "custom" && (
                <DateTimePicker
                  value={customStartTime}
                  onChange={setCustomStartTime}
                  label="Custom start time"
                />
              )}

              <div style={{ marginTop: "14px" }}>
                <Select
                  value={expirationOption}
                  onChange={setExpirationOption}
                  options={[
                    { value: "none", label: "Never" },
                    { value: "1hour", label: "In 1 hour" },
                    { value: "1day", label: "In 1 day" },
                    { value: "1week", label: "In 1 week" },
                    { value: "1month", label: "In 1 month" },
                    { value: "custom", label: "Custom date & time" },
                  ]}
                  label="Access expiration time"
                />
              </div>

              {expirationOption === "custom" && (
                <DateTimePicker
                  value={customExpirationTime}
                  onChange={setCustomExpirationTime}
                  label="Custom expiration time"
                  minDate={
                    startTimeOption === "custom"
                      ? customStartTime
                      : undefined
                  }
                />
              )}
            </div>
          )}

          <InlineMessage text={accountError} tone="error" />

          <div style={{ marginTop: "16px" }}>
            <TextButton
              text={userType === "resident" ? "Add resident" : "Add guest"}
              onClick={handleAddAccount}
              disabled={!newEmail}
              variant="contained"
            />
          </div>
        </div>
        )}

        {/* User Actions Dialog */}
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                position: "fixed",
                inset: 0,
                zIndex: 9998,
              }}
            />
            <Dialog.Content
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90vw",
                maxWidth: "400px",
                maxHeight: "85vh",
                padding: "24px",
                zIndex: 9999,
              }}
            >
              <Dialog.Title
                style={{
                  margin: 0,
                  marginBottom: "8px",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: palette.text.main,
                }}
              >
                Manage user
              </Dialog.Title>
              <Dialog.Description
                style={{
                  margin: 0,
                  marginBottom: "20px",
                  fontSize: "14px",
                  color: palette.gray.darkest,
                }}
              >
                {selectedUser?.email}
              </Dialog.Description>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Make owner - Owner only, can't make yourself owner */}
                {isCurrentUserOwner && !selectedUser?.isOwner && (
                  <button
                    onClick={handleMakeOwner}
                    style={{
                      padding: "12px 16px",
                      fontSize: "15px",
                      fontWeight: 500,
                      borderRadius: "8px",
                      border: "none",
                      background: palette.gray.main,
                      color: palette.text.main,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e8e8ec";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = palette.gray.main;
                    }}
                  >
                    Make owner
                  </button>
                )}

                {/* Make resident - Owner and Resident, for guests */}
                {(isCurrentUserOwner || isCurrentUserResident) && selectedUser?.isGuest && (
                    <button
                      onClick={handleMakeResident}
                      style={{
                        padding: "12px 16px",
                        fontSize: "15px",
                        fontWeight: 500,
                        borderRadius: "8px",
                        border: "none",
                        background: palette.gray.main,
                        color: palette.text.main,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e8e8ec";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = palette.gray.main;
                      }}
                    >
                      Make resident
                    </button>
                )}

                {/* Edit access schedule - Owner and Resident, for guests */}
                {(isCurrentUserOwner || isCurrentUserResident) && selectedUser?.isGuest && (
                    <button
                      onClick={handleEditSchedule}
                      style={{
                        padding: "12px 16px",
                        fontSize: "15px",
                        fontWeight: 500,
                        borderRadius: "8px",
                        border: "none",
                        background: palette.gray.main,
                        color: palette.text.main,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e8e8ec";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = palette.gray.main;
                      }}
                    >
                      Edit access schedule
                    </button>
                )}

                {/* Remove access - Complex logic:
                    - Owner can remove residents and guests (but not themselves)
                    - Residents can remove guests (but not themselves)
                    - Anyone can remove themselves (except owner - they must transfer ownership first)
                */}
                {(
                  // Owner removing others (residents or guests)
                  (isCurrentUserOwner && !selectedUser?.isOwner) ||
                  // Resident removing guests
                  (isCurrentUserResident && selectedUser?.isGuest && selectedUser.email !== userEmail) ||
                  // Anyone removing themselves (except owner)
                  (selectedUser?.email === userEmail && !isCurrentUserOwner)
                ) && (
                  <button
                    onClick={handleRemoveAccess}
                    style={{
                      padding: "12px 16px",
                      fontSize: "15px",
                      fontWeight: 500,
                      borderRadius: "8px",
                      border: "none",
                      background: "#fee",
                      color: "#c00",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fdd";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee";
                    }}
                  >
                    Remove access
                  </button>
                )}
              </div>

              <Dialog.Close asChild>
                <button
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: `1px solid ${palette.gray.dark}`,
                    background: "white",
                    color: palette.text.main,
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = palette.gray.main;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  Cancel
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Edit Schedule Dialog */}
        <Dialog.Root open={editScheduleOpen} onOpenChange={setEditScheduleOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                position: "fixed",
                inset: 0,
                zIndex: 9998,
              }}
            />
            <Dialog.Content
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90vw",
                maxWidth: "450px",
                maxHeight: "85vh",
                padding: "24px",
                zIndex: 9999,
                overflow: "auto",
              }}
            >
              <Dialog.Title
                style={{
                  margin: 0,
                  marginBottom: "8px",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: palette.text.main,
                }}
              >
                Edit access schedule
              </Dialog.Title>
              <Dialog.Description
                style={{
                  margin: 0,
                  marginBottom: "20px",
                  fontSize: "14px",
                  color: palette.gray.darkest,
                }}
              >
                {editingGuest?.email}
              </Dialog.Description>

              <div style={{ marginBottom: "14px" }}>
                <Select
                  value={startTimeOption}
                  onChange={setStartTimeOption}
                  options={[
                    { value: "now", label: "Now" },
                    { value: "custom", label: "Custom date & time" },
                  ]}
                  label="Access start time"
                />
              </div>

              {startTimeOption === "custom" && (
                <DateTimePicker
                  value={customStartTime}
                  onChange={setCustomStartTime}
                  label="Custom start time"
                />
              )}

              <div style={{ marginTop: "14px" }}>
                <Select
                  value={expirationOption}
                  onChange={setExpirationOption}
                  options={[
                    { value: "none", label: "Never" },
                    { value: "1hour", label: "In 1 hour" },
                    { value: "1day", label: "In 1 day" },
                    { value: "1week", label: "In 1 week" },
                    { value: "1month", label: "In 1 month" },
                    { value: "custom", label: "Custom date & time" },
                  ]}
                  label="Access expiration time"
                />
              </div>

              {expirationOption === "custom" && (
                <DateTimePicker
                  value={customExpirationTime}
                  onChange={setCustomExpirationTime}
                  label="Custom expiration time"
                  minDate={
                    startTimeOption === "custom"
                      ? customStartTime
                      : undefined
                  }
                />
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                <button
                  onClick={handleSaveSchedule}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    fontSize: "15px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    background: palette.blue.main,
                    color: "white",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = palette.blue.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = palette.blue.main;
                  }}
                >
                  Save changes
                </button>
                <Dialog.Close asChild>
                  <button
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      fontSize: "15px",
                      fontWeight: 600,
                      borderRadius: "8px",
                      border: `1px solid ${palette.gray.dark}`,
                      background: "white",
                      color: palette.text.main,
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = palette.gray.main;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </PageWrapper>
    </Page>
  );
};

export default ManageUsersPage;
