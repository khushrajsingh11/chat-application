import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {
  const { currentUser } = useUserStore();

  if (!currentUser) {
    return <div className="userInfo">Loading user info...</div>;
    
  }
  console.log(currentUser)

  return (
    <div className="userInfo">
      <div className="user">
        <img
          src={currentUser.avatar || "./avatar.png"}
          alt={`${currentUser.username || "User"}'s avatar`}
        />
        <h2>{currentUser.username || "Unknown User"}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="More options" />
        <img src="./video.png" alt="Start video chat" />
        <img src="./edit.png" alt="Edit profile" />
      </div>
    </div>
  );
};

export default Userinfo;
