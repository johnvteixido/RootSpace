use anyhow::{Context, Result};
use wasmer::{Instance, Module, Store, TypedFunction, imports};

pub struct WasmEngine {
    _store: Store,
}

impl WasmEngine {
    pub fn new() -> Self {
        Self {
            _store: Store::default(),
        }
    }

    #[allow(dead_code)]
    pub fn run_exploit(&mut self, wasm_bytes: &[u8]) -> Result<i32> {
        let module =
            Module::new(&self._store, wasm_bytes).context("Failed to compile Wasm module")?;
        let import_object = imports! {};
        let instance = Instance::new(&mut self._store, &module, &import_object)
            .context("Failed to instantiate Wasm module")?;

        let run_func: TypedFunction<(), i32> = instance
            .exports
            .get_typed_function(&self._store, "rootspace_run")
            .context("Wasm module must export 'rootspace_run() -> i32'")?;

        let result = run_func
            .call(&mut self._store)
            .context("Error during Wasm execution")?;
        Ok(result)
    }
}
