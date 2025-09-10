import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MessageThread = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleSendMessage = () => {
    if (newMessage?.trim() || attachments?.length > 0) {
      onSendMessage({
        content: newMessage,
        attachments: attachments,
        timestamp: new Date()
      });
      setNewMessage('');
      setAttachments([]);
    }
  };

  const handleFileAttach = (event) => {
    const files = Array.from(event?.target?.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev?.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-primary">Project Communication</h3>
        <p className="text-sm text-text-secondary">Direct messaging with your project team</p>
      </div>
      {/* Messages */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <div key={message?.id} className={`flex ${message?.isClient ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${message?.isClient ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-lg p-3 ${
                message?.isClient 
                  ? 'bg-accent text-accent-foreground ml-4' 
                  : 'bg-muted text-primary mr-4'
              }`}>
                {!message?.isClient && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Image
                      src={message?.sender?.avatar}
                      alt={message?.sender?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium">{message?.sender?.name}</span>
                  </div>
                )}
                
                <p className="text-sm">{message?.content}</p>
                
                {message?.attachments && message?.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message?.attachments?.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <Icon name="Paperclip" size={12} />
                        <span>{attachment?.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {formatTime(message?.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Message Input */}
      <div className="p-4 border-t border-border">
        {/* Attachments Preview */}
        {attachments?.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments?.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Icon name="Paperclip" size={14} />
                  <span className="text-sm">{file?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttachment(index)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e?.target?.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-accent focus:border-accent"
              rows={2}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              multiple
              onChange={handleFileAttach}
              className="hidden"
              id="message-attachment"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('message-attachment')?.click()}
            >
              <Icon name="Paperclip" size={16} />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage?.trim() && attachments?.length === 0}
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;