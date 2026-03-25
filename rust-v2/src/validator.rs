use anyhow::{Context, Result};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ProofOfPwn {
    pub cve: String,
    pub target: String,
    pub timestamp: u64,
    pub signature: String,  // Hex encoded
    pub public_key: String, // Hex encoded
}

pub struct Validator;

impl Validator {
    pub fn verify_signature(payload: &ProofOfPwn) -> Result<bool> {
        let sig_bytes =
            hex::decode(&payload.signature).context("Failed to decode signature hex")?;
        let pk_bytes =
            hex::decode(&payload.public_key).context("Failed to decode public key hex")?;

        let signature =
            Signature::from_slice(&sig_bytes).context("Invalid Dalek signature format")?;
        let public_key = VerifyingKey::from_bytes(
            &pk_bytes
                .try_into()
                .map_err(|_| anyhow::anyhow!("Invalid public key length"))?,
        )
        .context("Invalid Dalek VerifyingKey format")?;

        let message = format!("{}:{}:{}", payload.cve, payload.target, payload.timestamp);

        match public_key.verify(message.as_bytes(), &signature) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validator_struct_exists() {
        let _ = Validator;
    }
}
