import ProfilePictureEditor from "./components/ProfilePictureEditor";
import UserDashboardLayout from "@/Layout/UserDashboardLayout";

function ProfilePicture({ user }) {
  return <ProfilePictureEditor user={user} />;
}

ProfilePicture.layout = (page) => {
  return (
    <UserDashboardLayout
      activeSection="picture"
      user={page.props.user}
      title="Profile picture"
      description="Upload, crop, and edit the circular avatar shown across your account."
    >
      {page}
    </UserDashboardLayout>
  );
};

export default ProfilePicture;
