import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Rating,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { useMessagingApi } from '../../../services/messaging-api';
import { useNotification } from '../../../contexts/NotificationContext';

const OTHER_REASON = 'Other';

/** Labels for categories only stored historically (no longer in dropdown). */
const LEGACY_REASON_LABELS = {
    NotAccurate: 'Not accurate',
    Irrelevant: 'Irrelevant',
    MissingInstructions: 'Missing instructions',
    IncompleteResponse: 'Incomplete response',
};

const REASON_OPTIONS = [
    { value: 'FactuallyIncorrect', label: 'Factually incorrect' },
    { value: 'MissingImportantDetails', label: 'Missing important details' },
    { value: 'DidNotAnswerActualQuestion', label: 'Did not answer the actual question' },
    { value: 'ResponseTooGeneric', label: 'Response was too generic' },
    { value: 'ResponseTooLong', label: 'Response was too long' },
    { value: 'ResponseDifficultToUnderstand', label: 'Response was difficult to understand' },
    { value: 'FabricatedInformation', label: 'Fabricated information' },
    { value: 'WrongAssumptionsOrContext', label: 'Wrong assumptions/context' },
    { value: 'FailedToFollowConstraints', label: 'Failed to follow constraints' },
    { value: 'ToolActionFailure', label: 'Tool/action failure' },
    { value: 'UnsafeOrRiskyOutput', label: 'Unsafe/risky output' },
    { value: 'PoorCodeQuality', label: 'Poor code quality' },
    { value: 'PerformanceIssue', label: 'Performance issue' },
    { value: OTHER_REASON, label: 'Other' },
];

/**
 * Feedback UI for agent (outgoing) chat messages.
 */
const MessageFeedback = ({ message, agentName, onFeedbackSubmitted }) => {
    const messagingApi = useMessagingApi();
    const { showError, showSuccess } = useNotification();
    const [open, setOpen] = useState(false);
    const [starRating, setStarRating] = useState(0);
    const [reasonCategory, setReasonCategory] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isOutgoing = message.direction === 'Outgoing';
    const hasRouting =
        message.id &&
        message.threadId &&
        message.workflowId &&
        message.workflowType &&
        message.participantId;

    if (!isOutgoing || !hasRouting) {
        return null;
    }

    const fb = message.feedback;

    /** Submitted summary + “Rate response” sit below the bubble; visible on .message-row hover (always on touch). */
    const feedbackBarSx = {
        mt: 0.75,
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        opacity: 0,
        transition: 'opacity 0.2s ease',
        '.message-row:hover &': { opacity: 1 },
        '@media (hover: none)': { opacity: 1 },
    };

    const handleSubmit = async () => {
        if (starRating < 1) {
            showError('Please select a star rating');
            return;
        }
        if (starRating < 4 && !reasonCategory) {
            showError('Please select a reason for ratings below 4 stars');
            return;
        }
        if (starRating < 4 && reasonCategory === OTHER_REASON && !comment.trim()) {
            showError('Please add a comment when you select Other');
            return;
        }

        setSubmitting(true);
        try {
            const body = {
                messageId: message.id,
                threadId: message.threadId,
                agentName,
                workflowId: message.workflowId,
                workflowType: message.workflowType,
                participantId: message.participantId,
                starRating,
            };
            if (starRating < 4) {
                body.reasonCategory = reasonCategory;
            }
            if (comment.trim()) {
                body.comment = comment.trim();
            }

            await messagingApi.submitFeedback(body);

            const submittedAt = new Date().toISOString();
            onFeedbackSubmitted?.(message.id, {
                starRating,
                ...(starRating < 4 && reasonCategory ? { reasonCategory } : {}),
                ...(comment.trim() ? { comment: comment.trim() } : {}),
                submittedAt,
            });

            showSuccess('Thank you for your feedback');
            setOpen(false);
            setStarRating(0);
            setReasonCategory('');
            setComment('');
        } catch (e) {
            console.error(e);
            showError(e?.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={feedbackBarSx}>
            {fb ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                        Your rating:
                    </Typography>
                    <Rating value={fb.starRating} readOnly size="small" />
                    {fb.reasonCategory && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (
                            {REASON_OPTIONS.find((o) => o.value === fb.reasonCategory)?.label ||
                                LEGACY_REASON_LABELS[fb.reasonCategory] ||
                                fb.reasonCategory}
                            )
                        </Typography>
                    )}
                </Box>
            ) : (
                <>
                    <Button size="small" variant="text" color="secondary" onClick={() => setOpen(true)}>
                        Rate response
                    </Button>

                    <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth="xs" fullWidth>
                        <DialogTitle>Rate this response</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                How helpful was this reply?
                            </Typography>
                            <Rating
                                name="message-feedback-stars"
                                value={starRating}
                                onChange={(_e, v) => setStarRating(v || 0)}
                                size="large"
                            />

                            {starRating > 0 && starRating < 4 && (
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel id="feedback-reason-label">Reason</InputLabel>
                                    <Select
                                        labelId="feedback-reason-label"
                                        label="Reason"
                                        value={reasonCategory}
                                        onChange={(e) => setReasonCategory(e.target.value)}
                                    >
                                        {REASON_OPTIONS.map((o) => (
                                            <MenuItem key={o.value} value={o.value}>
                                                {o.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                label={
                                    starRating > 0 && starRating < 4 && reasonCategory === OTHER_REASON
                                        ? 'Comment (required)'
                                        : 'Comment (optional)'
                                }
                                required={
                                    !!(starRating > 0 && starRating < 4 && reasonCategory === OTHER_REASON)
                                }
                                multiline
                                minRows={2}
                                fullWidth
                                sx={{ mt: 2 }}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleSubmit} disabled={submitting || starRating < 1}>
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
};

export default MessageFeedback;
