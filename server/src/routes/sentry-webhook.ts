import { Router, Request, Response } from 'express';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/node';
import { createHash } from 'crypto';

const router = Router();

/**
 * Sentry Webhook Receiver
 * Receives error notifications from Sentry and stores them for agent access
 */
router.post('/sentry/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    logger.info('Sentry webhook received', { 
      action: event.action,
      eventType: event.event_type || 'unknown',
      hasIssue: !!event.issue,
      hasData: !!event.data
    });
    
    // Verify webhook secret (optional but recommended)
    const webhookSecret = process.env.SENTRY_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['sentry-hook-secret'] !== webhookSecret) {
      logger.warn('Sentry webhook unauthorized', { 
        hasSecret: !!webhookSecret,
        headerSecret: req.headers['sentry-hook-secret'] ? 'present' : 'missing'
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Handle different Sentry webhook event types
    // Sentry sends different payloads for different actions (issue.created, issue.updated, etc.)
    let issue = event.issue || event.data?.issue;
    let project = event.project || event.data?.project;
    
    // Skip test payloads that don't have proper Sentry structure
    if (!issue && !event.data && event.test) {
      logger.info('Test webhook payload received');
      return res.status(200).json({ success: true, message: 'Test payload received, webhook is working' });
    }

    // If no issue data, log the raw payload for debugging
    if (!issue) {
      logger.warn('Sentry webhook received without issue data', { 
        action: event.action,
        eventType: event.event_type,
        bodyKeys: Object.keys(event)
      });
      // Still try to extract what we can
      issue = {
        id: event.id || `unknown-${Date.now()}`,
        title: event.title || 'Unknown Error',
        level: event.level || 'error',
        culprit: event.message || event.culprit || '',
        permalink: event.url || event.permalink || '',
        tags: event.tags || {},
      };
    }

    // Extract error information from Sentry webhook payload
    // Ensure sentry_id is NEVER null - this is a required field
    let sentryId = issue?.id || issue?.shortId || event?.id || event?.issue_id || 
                   event?.data?.issue?.id || event?.data?.issue_id || null;
    
    // If still null, try to extract from raw_data or generate a unique ID
    if (!sentryId) {
      // Try to find any ID-like field in the event
      sentryId = event?.resource?.id || event?.resource_id || 
                  event?.webhook_id || event?.event_id || null;
    }
    
    // Last resort: generate a unique ID based on timestamp and hash of payload
    if (!sentryId) {
      const payloadHash = createHash('md5')
        .update(JSON.stringify(event))
        .digest('hex')
        .substring(0, 8);
      sentryId = `webhook-${Date.now()}-${payloadHash}`;
      logger.warn('Generated fallback sentry_id', { sentry_id: sentryId, eventKeys: Object.keys(event) });
    }
    
    // Ensure sentry_id is a string and never null/undefined
    const sentryIdString = String(sentryId);
    if (!sentryIdString || sentryIdString === 'null' || sentryIdString === 'undefined') {
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      logger.error('sentry_id was null/undefined, using fallback', { fallback_id: fallbackId });
      sentryId = fallbackId;
    }
    
    const projectSlug = project?.slug || event?.project_slug || event?.project?.slug || 'unknown';
    const environment = event?.environment || issue?.environment || 'production';
    
    const errorData = {
      sentry_id: String(sentryId),
      title: issue.title || event.title || 'Unknown Error',
      message: issue.culprit || event.message || issue.message || '',
      level: issue.level || event.level || 'error',
      url: issue.permalink || event.url || issue.url || '',
      environment: environment,
      tags: issue.tags || event.tags || {},
      metadata: issue.metadata || event.metadata || {},
      timestamp: issue.lastSeen || event.timestamp || issue.timestamp || new Date().toISOString(),
      project: projectSlug,
      raw_data: JSON.stringify(event),
    };

    // Store in database
    const pool = getPool();
    await pool.query(
      `INSERT INTO sentry_errors (
        sentry_id, title, message, level, url, environment, 
        tags, metadata, timestamp, project, raw_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (sentry_id) DO UPDATE SET
        title = EXCLUDED.title,
        message = EXCLUDED.message,
        level = EXCLUDED.level,
        url = EXCLUDED.url,
        updated_at = NOW()`,
      [
        errorData.sentry_id,
        errorData.title,
        errorData.message,
        errorData.level,
        errorData.url,
        errorData.environment,
        JSON.stringify(errorData.tags),
        JSON.stringify(errorData.metadata),
        errorData.timestamp,
        errorData.project,
        errorData.raw_data,
      ]
    );

    logger.info('Sentry error received and stored', {
      sentry_id: errorData.sentry_id,
      title: errorData.title,
      level: errorData.level,
    });

    res.status(200).json({ success: true, error_id: errorData.sentry_id });
  } catch (error) {
    logger.error('Error processing Sentry webhook:', error);
    Sentry.captureException(error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

