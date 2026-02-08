import asyncio
import json
import logging

import boto3
from botocore.exceptions import ClientError

from src.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def debug_minio():
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
    )

    bucket = settings.S3_BUCKET
    logger.info(f"Checking bucket: {bucket}")

    # 1. Check Bucket Exists
    try:
        s3.head_bucket(Bucket=bucket)
        logger.info(f"Bucket '{bucket}' exists.")
    except ClientError as e:
        logger.error(f"Bucket check failed: {e}")
        return

    # 2. Check and Set Bucket Policy
    try:
        policy = s3.get_bucket_policy(Bucket=bucket)
        logger.info(f"Bucket Policy: {policy['Policy']}")
    except ClientError as e:
        logger.error(f"Failed to get bucket policy: {e}")

        # Force set public policy
        logger.info("Attempting to set public policy...")
        policy_doc = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket}/*"],
                }
            ],
        }
        try:
            s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps(policy_doc))
            logger.info("Successfully set public bucket policy.")
        except ClientError as e2:
            logger.error(f"Failed to set policy: {e2}")

    # 3. List Objects
    try:
        objs = s3.list_objects_v2(Bucket=bucket)
        if "Contents" in objs:
            count = len(objs["Contents"])
            logger.info(f"Found {count} objects.")
            if count > 0:
                first_key = objs["Contents"][0]["Key"]
                logger.info(f"Sample Object Key: {first_key}")
                # Construct public URL
                public_url = f"{settings.S3_PUBLIC_ENDPOINT}/{bucket}/{first_key}"
                logger.info(f"Public URL should be: {public_url}")
        else:
            logger.info("Bucket is empty.")
    except ClientError as e:
        logger.error(f"Failed to list objects: {e}")


if __name__ == "__main__":
    asyncio.run(debug_minio())
