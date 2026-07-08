'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getVideos, getComments, addComment, toggleLikeComment, deleteComment, updateVideo } from '@/lib/firestore';
import { getVideoEmbedUrl, getVideoThumbnailUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Play, MessageSquare, Send, Reply, ThumbsUp, Trash2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import Link from 'next/link';

const Avatar = ({ src, name, size = 40 }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: size * 0.45, flexShrink: 0 }}>
        {name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setError(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
};

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // commentId
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingComments, setTogglingComments] = useState(false);

  const handleToggleComments = async () => {
    if (!isAdmin) return;
    setTogglingComments(true);
    try {
      const newState = !video.commentsDisabled;
      await updateVideo(id, { commentsDisabled: newState });
      setVideo(prev => ({ ...prev, commentsDisabled: newState }));
    } catch (error) {
      console.error('Error toggling comments:', error);
    } finally {
      setTogglingComments(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch all videos for suggestion logic
        const allVideos = await getVideos();
        const currentVideo = allVideos.find(v => v.id === id);
        
        if (!currentVideo) {
          router.push('/videos');
          return;
        }

        setVideo(currentVideo);

        // Get suggested videos (same category, excluding current)
        let suggested = allVideos.filter(v => v.id !== id && v.category === currentVideo.category);
        if (suggested.length === 0) {
          suggested = allVideos.filter(v => v.id !== id).slice(0, 5); // Fallback if no same category
        }
        setSuggestedVideos(suggested.slice(0, 10)); // Max 10

        // Fetch comments
        fetchComments();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments(id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmittingComment(true);
    try {
      await addComment(id, user, commentText.trim(), replyingTo);
      setCommentText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) return;
    try {
      await deleteComment(commentId);
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;
    try {
      await toggleLikeComment(commentId, user.uid);
      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,107,0,0.3)', borderTopColor: '#FF6B00', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!video) return null;

  // Group comments into parent and replies
  const parentComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId).reverse(); // Oldest replies first

  return (
    <div style={{ 
      backgroundColor: '#0A0810', 
      color: 'white', 
      minHeight: 'calc(100vh - 64px)', 
      margin: '-32px -24px', 
      borderRadius: '24px 24px 0 0',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      paddingBottom: '80px',
      fontFamily: 'var(--font-body)',
    }}>
      
      {/* FULL WIDTH PLAYER SECTION */}
      <div style={{ width: '100%', backgroundColor: '#000', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 2000, margin: '0 auto', paddingTop: '42%' }}>
          <iframe
            src={getVideoEmbedUrl(video.videoUrl)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {video.videoUrl?.includes('drive.google.com') && (
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', zIndex: 10, cursor: 'default' }} title=" " />
          )}
          {(video.videoUrl?.includes('youtube') || video.videoUrl?.includes('youtu.be')) && (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', zIndex: 10, cursor: 'default' }} title=" " />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', height: '65px', zIndex: 10, cursor: 'default' }} title=" " />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '250px', height: '65px', zIndex: 10, cursor: 'default' }} title=" " />
            </>
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
      
        {/* Back to Videos */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/videos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#A0A0A0', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#A0A0A0'}>
            <ArrowLeft size={16} /> Kembali ke Daftar Video
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Video Info */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '0.02em', color: 'white', marginBottom: 8, lineHeight: 1.1 }}>{video.title}</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, fontSize: 13, color: '#A0A0A0', fontWeight: 600 }}>
              <span style={{ color: '#10b981' }}>New Release</span>
              <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 4 }}>2025</span>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>HD</span>
              <span style={{ textTransform: 'capitalize' }}>{video.category || 'Video'}</span>
            </div>
            {video.description && (
              <div style={{ padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: '#E0E0E0', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{video.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION: Suggest Videos (Episodes) */}
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 16 }}>Episode Selanjutnya</h3>
          
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
            {suggestedVideos.map((sVideo, index) => (
              <Link href={`/watch/${sVideo.id}`} key={sVideo.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none', width: 240, flexShrink: 0, group: 'true' }} className="suggest-card">
                <style dangerouslySetInnerHTML={{__html: `
                  .suggest-card:hover .suggest-title { color: #FF6B00 !important; }
                  .suggest-card:hover .suggest-thumb { transform: scale(1.05); }
                `}} />
                
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', backgroundColor: '#222' }}>
                  <img 
                    src={sVideo.thumbnailUrl || getVideoThumbnailUrl(sVideo.videoUrl) || ''} 
                    alt={sVideo.title}
                    className="suggest-thumb"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />
                  <div style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    {sVideo.category}
                  </div>
                  <div style={{ position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(255,107,0,0.9)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                    Ep {index + 1}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h4 className="suggest-title" style={{ color: 'white', fontSize: 15, fontWeight: 600, margin: '0 0 4px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s' }}>
                    {sVideo.title}
                  </h4>
                  <div style={{ color: '#888', fontSize: 13 }}>
                    Digital Souvenir
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <hr style={{ border: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />

          {/* BOTTOM SECTION: Comments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <MessageSquare size={20} color="#FF6B00" /> Komentar ({comments.length})
            </h3>
            
            {isAdmin && (
              <button 
                onClick={handleToggleComments}
                disabled={togglingComments}
                style={{ 
                  padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  backgroundColor: video.commentsDisabled ? '#10b981' : 'rgba(239, 68, 68, 0.1)',
                  color: video.commentsDisabled ? 'white' : '#ef4444',
                  border: video.commentsDisabled ? 'none' : '1px solid rgba(239, 68, 68, 0.3)',
                  cursor: togglingComments ? 'wait' : 'pointer'
                }}
              >
                {togglingComments ? 'Memproses...' : video.commentsDisabled ? 'Aktifkan Komentar' : 'Nonaktifkan Komentar'}
              </button>
            )}
          </div>

          {/* Comment Form */}
          {video.commentsDisabled ? (
            <div style={{ padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8, color: '#888', fontSize: 14, marginBottom: 32, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
              Komentar untuk video ini telah dinonaktifkan.
            </div>
          ) : user ? (
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'flex-start' }}>
              <Avatar src={user.photoURL} name={user.displayName || user.email} size={40} />
              <div style={{ flex: 1 }}>
                {replyingTo && (
                  <div style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Reply size={12} /> Membalas komentar... 
                    <button type="button" onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#FF6B00', cursor: 'pointer', padding: 0, marginLeft: 4 }}>Batal</button>
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tambahkan komentar..."
                    disabled={submittingComment}
                    style={{ 
                      width: '100%', padding: '12px 48px 12px 16px', borderRadius: 8, 
                      backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', 
                      color: 'white', fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
                      borderBottomLeftRadius: 0, borderBottomRightRadius: 0
                    }}
                    onFocus={e => e.target.style.borderBottomColor = '#FF6B00'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
                  />
                  <button 
                    type="submit" 
                    disabled={!commentText.trim() || submittingComment}
                    style={{ 
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: commentText.trim() ? '#FF6B00' : 'rgba(255,255,255,0.2)', 
                      cursor: commentText.trim() ? 'pointer' : 'default', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#A0A0A0', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
              Silakan masuk (login) untuk menambahkan komentar.
            </div>
          )}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {parentComments.length === 0 ? (
              <div style={{ color: '#666', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>Belum ada komentar. Jadilah yang pertama!</div>
            ) : (
              parentComments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: 16 }}>
                  <Avatar src={comment.userPhoto} name={comment.userName} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{comment.userName}</span>
                      <span style={{ color: '#888', fontSize: 12 }}>
                        {comment.createdAt?.toMillis ? formatDistanceToNow(comment.createdAt.toMillis(), { addSuffix: true, locale: idLocale }) : 'Baru saja'}
                      </span>
                    </div>
                    <p style={{ color: '#E0E0E0', fontSize: 15, margin: '0 0 8px 0', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {comment.text}
                    </p>
                    
                    {/* Comment Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        style={{ background: 'none', border: 'none', color: (comment.likes || []).includes(user?.uid) ? '#FF6B00' : '#888', cursor: user ? 'pointer' : 'default', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}
                      >
                        <ThumbsUp size={14} fill={(comment.likes || []).includes(user?.uid) ? '#FF6B00' : 'none'} /> 
                        {(comment.likes || []).length > 0 ? (comment.likes || []).length : ''}
                      </button>
                      
                      {user && (
                        <button 
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 500 }}
                        >
                          Balas
                        </button>
                      )}
                      
                      {(isAdmin || (user && user.uid === comment.userId)) && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 500, opacity: 0.7 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {getReplies(comment.id).length > 0 && (
                      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {getReplies(comment.id).map(reply => (
                          <div key={reply.id} style={{ display: 'flex', gap: 12 }}>
                            <Avatar src={reply.userPhoto} name={reply.userName} size={32} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                                <span style={{ fontWeight: 600, color: 'white', fontSize: 13 }}>{reply.userName}</span>
                                <span style={{ color: '#888', fontSize: 11 }}>
                                  {reply.createdAt?.toMillis ? formatDistanceToNow(reply.createdAt.toMillis(), { addSuffix: true, locale: idLocale }) : 'Baru saja'}
                                </span>
                              </div>
                              <p style={{ color: '#D0D0D0', fontSize: 14, margin: '0 0 6px 0', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                {reply.text}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <button 
                                  onClick={() => handleLikeComment(reply.id)}
                                  style={{ background: 'none', border: 'none', color: (reply.likes || []).includes(user?.uid) ? '#FF6B00' : '#888', cursor: user ? 'pointer' : 'default', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
                                >
                                  <ThumbsUp size={12} fill={(reply.likes || []).includes(user?.uid) ? '#FF6B00' : 'none'} /> 
                                  {(reply.likes || []).length > 0 ? (reply.likes || []).length : ''}
                                </button>
                                {(isAdmin || (user && user.uid === reply.userId)) && (
                                  <button 
                                    onClick={() => handleDeleteComment(reply.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 500, opacity: 0.7 }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Form */}
                    {replyingTo === comment.id && user && !video.commentsDisabled && (
                      <form onSubmit={handlePostComment} style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'flex-start' }}>
                        <Avatar src={user.photoURL} name={user.displayName || user.email} size={32} />
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Balas komentar ini..."
                            disabled={submittingComment}
                            autoFocus
                            style={{ 
                              width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, 
                              backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', 
                              color: 'white', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                              borderBottomLeftRadius: 0, borderBottomRightRadius: 0
                            }}
                            onFocus={e => e.target.style.borderBottomColor = '#FF6B00'}
                            onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
                          />
                          <button 
                            type="submit" 
                            disabled={!commentText.trim() || submittingComment}
                            style={{ 
                              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                              background: 'none', border: 'none', color: commentText.trim() ? '#FF6B00' : 'rgba(255,255,255,0.2)', 
                              cursor: commentText.trim() ? 'pointer' : 'default', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
