import { formatDate } from "../utils/DateFormatter.js";
import { formatNumber } from "../utils/NumberFormatter.js";
import { GOOGLE_STORAGE_URL } from "../utils/config.js";

export const PostDetail = (post) => `
  <h1 class="post-title">${post.title}</h1>
  <div class="post-user-info">
    <div class="post-author">
      <div
        class="author-img"
        style="background-image: url(${GOOGLE_STORAGE_URL}/${post.authorProfileImage})"
      ></div>
      <span class="author-name">${post.authorNickname}</span>
      <span class="post-date">${formatDate(post.createdAt)}</span>
    </div>
    <div class="${post.isAuthor ? "post-actions" : "post-actions disable"}">
      <button id="edit-button" class="edit-btn">수정</button>
      <button id="delete-button" class="delete-btn">삭제</button>
    </div>
  </div>

  <hr class="divider"/>

  <p class="post-content">${post.content}</p>

  <div class="post-stats">
    <div id="like-count" class="${post.liked ? "stat-box enable" : "stat-box"}">
      ${formatNumber(post.likes)}<br/><span>좋아요수</span>
    </div>
    <div class="stat-box">${formatNumber(post.views)}<br/><span>조회수</span></div>
    <div class="stat-box">${formatNumber(post.comments)}<br/><span>댓글</span></div>
  </div>
`;
