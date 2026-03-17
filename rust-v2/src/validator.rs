use serde::{Deserialize, Serialize};
use ed25519_dalek::{Signature, VerifyingKey, Verifier};
use std::error::Error;

#[derive(Serialize, Deserialize, Debug)]
pub struct ProofOfPwn {
    pub cve: String,
    pub target: String,
    pub timestamp: u64,
    pub signature: String, // Hex encoded
    pub public_key: String, // Hex encoded
}

pub struct Validator;

impl Validator {
    pub fn verify_signature(payload: &ProofOfPwn) -> Result<bool, Box<dyn Error>> {
        let sig_bytes = hex::decode(&payload.signature)?;
        let pk_bytes = hex::decode(&payload.public_key)?;

        let signature = Signature::from_slice(&sig_bytes)?;
        let public_key = VerifyingKey::from_bytes(
            &pk_bytes.try_into().map_err(|_| "Invalid public key length")?
        )?;

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
