'use client';

import api from '@/lib/api';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: '管理者',
  user: 'ユーザー',
};

export default function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [dialog, setDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setCurrentUserId(JSON.parse(stored).id);
      } catch {
        /* ignore */
      }
    }
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/users');
        setUsers(res.data.users);
      } catch {
        setError('ユーザーの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const openEdit = (user: User) => {
    setEditTarget(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditError(null);
    setDialog(true);
  };

  const closeEdit = () => {
    setDialog(false);
    setEditTarget(null);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    const name = editName.trim();
    const email = editEmail.trim();
    if (!name || !email) {
      setEditError('名前とメールアドレスは必須です');
      return;
    }
    setSaving(true);
    setEditError(null);
    try {
      const params: Record<string, string> = {};
      if (name !== editTarget.name) params.name = name;
      if (email !== editTarget.email) params.email = email;
      if (editRole !== editTarget.role) params.role = editRole;
      const res = await api.patch(`/api/users/${editTarget.id}`, params);
      setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? res.data : u)));
      closeEdit();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setEditError(msg ?? '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      alert('自分自身は削除できません');
      return;
    }
    if (!confirm(`「${user.name}」を削除しますか？`)) return;
    await api.delete(`/api/users/${user.id}`);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        ユーザー管理
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
        }}
      >
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: 'grey.50',
                  '& th': {
                    color: 'text.secondary',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <TableCell>ID</TableCell>
                <TableCell>名前</TableCell>
                <TableCell>メールアドレス</TableCell>
                <TableCell>ロール</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'text.disabled', py: 6 }}>
                    ユーザーがいません
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {user.id}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        {user.id === currentUserId && (
                          <Chip label="自分" size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={ROLE_LABELS[user.role] ?? user.role}
                        size="small"
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        variant={user.role === 'admin' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="編集">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEdit(user)}
                            aria-label={`${user.name}を編集`}
                          >
                            <Pencil size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.id === currentUserId ? '自分自身は削除できません' : '削除'}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={user.id === currentUserId}
                              onClick={() => handleDelete(user)}
                              aria-label={`${user.name}を削除`}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={dialog}
        onClose={closeEdit}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.28)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
          }}
        >
          ユーザーを編集
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              label="名前"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="メールアドレス"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="ロール"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
              fullWidth
              size="small"
            >
              <MenuItem value="user">ユーザー</MenuItem>
              <MenuItem value="admin">管理者</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
          <Button variant="outlined" onClick={closeEdit}>
            キャンセル
          </Button>
          <Button variant="contained" disabled={saving} onClick={handleUpdate}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
