import React, { useState } from 'react';
import Card from '../../ui/Card';
import Typography from '../../ui/Typography';
import Button from '../../ui/Button';

const VerificationLobby = () => {
  const [file, setFile] = useState(null);

  return (
    <Card variant="glass" className="p-8 max-w-2xl">
      <Typography variant="h2" className="mb-4">Verification Lobby</Typography>
      <Typography variant="p" className="mb-6">
        Please chat with an officer to verify your credentials. You can also upload necessary documents below.
      </Typography>
      <div className="flex flex-col gap-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <Button>Upload Document</Button>
        <div className="h-64 bg-[var(--bg-main)] rounded-lg p-4 border border-[var(--border)] overflow-y-auto">
          {/* Chat component placeholder */}
          <Typography variant="muted">Live chat with officer...</Typography>
        </div>
      </div>
    </Card>
  );
};

export default VerificationLobby;
