import React from "react";
import { useUserProfilePage } from "./services/useUserProfilePage";
import UserProfileView from "./components/UserProfileView";
import { FORM_TYPES, SECTIONS } from "./models/constants";

const UserProfilePage = () => {
  const profileState = useUserProfilePage();

  if (!profileState || !profileState.isLoggedIn) {
    return null;
  }

  return (
    <UserProfileView
      user={profileState.user}
      state={profileState.state}
      FORM_TYPES={FORM_TYPES}
      SECTIONS={SECTIONS}
      handleInputChange={profileState.handleInputChange}
      handleSubmitProfileUpdate={profileState.handleSubmitProfileUpdate}
      handleSubmitPasswordChange={profileState.handleSubmitPasswordChange}
      handleAddAddress={profileState.handleAddAddress}
      handleDeleteAddress={profileState.handleDeleteAddress}
      setActiveSection={profileState.setActiveSection}
    />
  );
};

export default UserProfilePage;
